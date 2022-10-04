import { render } from 'react-dom';
import Application from './Application';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

const app = (
  <QueryClientProvider client={queryClient}>
    <Application />
  </QueryClientProvider>
);

render(app, document.getElementById('app'));
