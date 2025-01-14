import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider, split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import App from './App';

// Create an HTTP link
const httpLink = new HttpLink({
  uri: 'https://flyby-router-demo.herokuapp.com/',
});

// Create a WebSocket link
// const wsLink = new WebSocketLink({
//   uri: `wss://streaming.bitquery.io/graphql?token=ory_at_2iLZ5jqKdMFTVIN79-SugmLIXft3tz0zNvl2PqD9WC4.A94hNVj2V-B6jP0aizxRt0jzs0SX6HnmzjdTDOh7pjQ`,
//   options: {
//     reconnect: true,
//   },
// });

// Use the split function to direct traffic between the two links
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  // wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

// Supported in React 18+
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
);