import aplpkg from '@apollo/client';
const { gql } = aplpkg;

export default async function clearTableData(tableName, client, dryRun) {
    if(dryRun){
      console.log(`Simulating clearing table ${tableName} in ${client.link.options.uri}`)
    } else {
      console.log(`Clearing table ${tableName} in ${client.link.options.uri}`)
      const result = (await client.mutate({
          mutation: gql`
      mutation delete_all_${tableName} {
        delete_${tableName} (
          where: {}
        ) {
          affected_rows
        }
      }
    `}));
     console.log(JSON.stringify(result));
    }
}