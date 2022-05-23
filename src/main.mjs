import transferTableData from './transferTableData.mjs'
import clearTableData from './clearTableData.mjs'
import fs from 'fs/promises';
import { debug } from 'console';

import fetch from 'cross-fetch';
import aplpkg from '@apollo/client';
const { ApolloClient, gql, InMemoryCache, HttpLink } = aplpkg;
import 'dotenv/config'


(async () => {
  const dryRun = false;

  const oldClient = new ApolloClient({
    cache: new InMemoryCache({
        addTypename: false
    }),
    link: new HttpLink({
        uri: process.env.OLD_HASURA_URL, fetch,
        headers: {
            'x-hasura-admin-secret': process.env.OLD_HASURA_ADMIN_SECRET ?? ''
        }
    })
  });

  const newClient = new ApolloClient({
    cache: new InMemoryCache({
        addTypename: false
    }),
    link: new HttpLink({
        uri: process.env.NEW_HASURA_URL, fetch,
        headers: {
            'x-hasura-admin-secret': process.env.NEW_HASURA_ADMIN_SECRET ?? ''
        }
    })
  });

  if(dryRun){
    console.log('Simulating Data Transfer\n');
  } else {
    console.log('Starting Data Transfer\n');
  }
  
  let transferInfo = null;
  try{
    transferInfo = JSON.parse(await fs.readFile('./transfer.json'));
  } catch (e){
    console.error('Cannot load transfer.json file');
    console.error(e);
    return;
  }

  for (const [table, columns] of Object.entries(transferInfo).reverse()) {
    await clearTableData(table, newClient, dryRun)
  }

  for (const [table, columns] of Object.entries(transferInfo)) {
    await transferTableData(table, columns, oldClient, newClient, dryRun);
  }
  
  if(dryRun){
    console.log('Simulated Data Transfer Complete');
  } else {
    console.log('Data Transfer Complete');
  }

})();