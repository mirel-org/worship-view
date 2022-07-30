import ReactDOM from 'react-dom';
import { inDev } from '@common/helpers';
import Application from './Application';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

const app = (
  <QueryClientProvider client={queryClient}>
    <Application />
  </QueryClientProvider>
);

ReactDOM.render(app, document.getElementById('app'));

if (inDev() && module.hot) module.hot.accept();
