import aplpkg from '@apollo/client';
const { gql } = aplpkg;

async function queryGraph(tableName, columnNames, client) {
    const query = gql`
    query get_all_${tableName} {
      ${tableName} {
        ${columnNames.join('\n')}
      }
    }
    `
    const objects = (await client.query({ query: query })).data[tableName];
    console.log(JSON.stringify(objects));
    return objects;
}

async function insertIntoGraph(tableName, objects, client) {
    const mutation = gql`
    mutation add_all_${tableName}($objects: [${tableName}_insert_input!]!) {
      insert_${tableName}(objects: $objects) {
        affected_rows
      }
    }  
    `
    const result = (await client.mutate({ mutation: mutation, variables: {objects: objects }}));
    console.log(JSON.stringify(result));
}

export default async function transferTableData(tableName, columnNames, oldClient, newClient, dryRun) {
    console.log(`Migrating table: ${tableName}`)
    const entries = await queryGraph(tableName, columnNames, oldClient);
    if(dryRun){
      console.log(`Simulating inserting ${entries} from ${tableName} into: ${newClient.link.options.uri}`)
    } else {
      console.log(`Inserting ${entries} from ${tableName} into: ${newClient.link.options.uri}`)
      await insertIntoGraph(tableName, entries, newClient);
    }
    console.log('')
}