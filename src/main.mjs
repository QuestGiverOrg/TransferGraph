import transferTableData from './transferTableData.mjs'
import fs from 'fs/promises';

(async () => {

  console.log('Starting Data Transfer\n');
  
  let transferInfo = null;
  try{
    transferInfo = JSON.parse(await fs.readFile('./transfer.json'));
  } catch (e){
    console.error('Cannot load transfer.json file');
    console.error(e);
    return;
  }

  for (const [table, columns] of Object.entries(transferInfo)) {
    await transferTableData(table, columns, true, true);
  }
  
  console.log('Data Transfer Complete');

})();