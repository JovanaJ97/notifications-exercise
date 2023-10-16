const PARSE_LINK_HEADER_MAXLEN = 2000;
const PARSE_LINK_HEADER_THROW_ON_MAXLEN_EXCEEDED = false;

interface Link {
	rel: string;
	url: string;
	[key: string]: string;
}

function hasRel(x: Link | undefined): x is Link {
	return x !== undefined && x.rel !== undefined;
}

function intoRels(acc: Record<string, Link>, x: Link): Record<string, Link> {
	function splitRel(rel: string): void {
		acc[rel] = { ...x, rel };
	}

	x.rel.split(/\s+/).forEach(splitRel);

	return acc;
}

export function parseSingleLink(linkHeader: string): Link | undefined {
	const linkRegex = /<([^>]+)>(?:\s*;\s*(.+))?/i;
	const matches = linkHeader.match(linkRegex);
	if (!matches) return undefined;

	const url = new URL(matches[1]);
	const params =
		matches[2]
			?.split(';')
			.map((param) => param.trim().split('='))
			.reduce((acc: Record<string, string>, [key, value]) => {
				if (value && value.startsWith('"') && value.endsWith('"')) {
					value = value.slice(1, -1);
				}
				acc[key] = value;
				return acc;
			}, {}) ?? {};

	return {
		rel: '',
		...Object.fromEntries(url.searchParams),
		...params,
		url: url.href,
	};
}

function checkHeader(linkHeader: string | null): boolean {
	if (!linkHeader) return false;

	if (linkHeader.length > PARSE_LINK_HEADER_MAXLEN) {
		if (PARSE_LINK_HEADER_THROW_ON_MAXLEN_EXCEEDED) {
			throw new Error(
				'Input string too long, it should be under ' +
					PARSE_LINK_HEADER_MAXLEN +
					' characters.'
			);
		} else {
			return false;
		}
	}
	return true;
}

export function parseLinkHeader(
	linkHeader: string | null
): Record<string, Link> | null {
	if (!linkHeader || !checkHeader(linkHeader)) return null;

	return linkHeader
		.split(/,\s*/)
		.map((e) => {
			return e;
		})

		.map(parseSingleLink)
		.filter(Boolean)
		.filter(hasRel)
		.reduce(intoRels, {});
}
