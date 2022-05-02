import fetch from 'cross-fetch';
import aplpkg from '@apollo/client';
const { ApolloClient, gql, InMemoryCache, HttpLink } = aplpkg;
import 'dotenv/config'

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

async function queryOldGraph(tableName, columnNames, shouldPrint) {
    const query = gql`
    query get_all_${tableName} {
      ${tableName} {
        ${columnNames.join('\n')}
      }
    }
    `
    const objects = (await oldClient.query({ query: query })).data[tableName];
    if (shouldPrint) console.log(JSON.stringify(objects));
    return objects;
}

async function clearTableInNewGraph(tableName, shouldPrint) {
    const result = (await newClient.mutate({
        mutation: gql`
    mutation delete_all_${tableName} {
      delete_${tableName} (
        where: {}
      ) {
        affected_rows
      }
    }
  `}));
    if (shouldPrint) console.log(JSON.stringify(result));
}

async function insertIntoNewGraph(tableName, objects, shouldPrint) {
    const mutation = gql`
    mutation add_all_${tableName}($objects: [${tableName}_insert_input!]!) {
      insert_${tableName}(objects: $objects) {
        affected_rows
      }
    }  
    `
    const result = (await newClient.mutate({ mutation: mutation, variables: {objects: objects }}));
    if (shouldPrint) console.log(JSON.stringify(result));
}

export default async function transferTableData(tableName, columnNames, shouldClear = false, shouldPrint = true) {
    if(shouldPrint) console.log(`Migrating table: ${tableName}`)
    const boolFlags = await queryOldGraph(tableName, columnNames, shouldPrint);
    if(shouldClear) await clearTableInNewGraph(tableName, shouldPrint);
    await insertIntoNewGraph(tableName, boolFlags, shouldPrint);
    if(shouldPrint) console.log('')
}