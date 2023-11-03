import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Context
import NotificationContextProvider from './context/notificationContext';

// Components
import Header from './components/Header';
import Homepage from './components/Homepage';

function App() {
	return (
		<>
			<QueryClientProvider client={queryClient}>
				<ReactQueryDevtools initialIsOpen={false} />
				<NotificationContextProvider>
					<Header />
					<Homepage />
				</NotificationContextProvider>
			</QueryClientProvider>
		</>
	);
}

export default App;
