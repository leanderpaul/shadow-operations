/**
 * Importing npm packages
 */
import { Command } from 'commander';
import { MongoClient } from 'mongodb';

/**
 * Importing user defined packages
 */
import { Validator, Logger } from '../utils';

/**
 * Defining types
 */
interface Options {
  collection: string[];
  drop: boolean;
  dryRun: boolean;
  batchSize: number;
}

/**
 * Declaring the constants
 */

const command = new Command();
const logger = new Logger(command);

command
  .name('migrate')
  .description('Migrate the data from the source database to the destination database')
  .option('-c, --collection <collections...>', 'specify collection names to migrate, by default all collections will be migrated', [])
  .option('-D, --drop', 'Drop destination database before migrating', false)
  .option('-d, --dry-run', 'Dry run', false)
  .option('-s, --batch-size <size>', 'Number of documents to copy in a single batch', Validator.int, 1000)
  .argument('<src>', 'Source database uri')
  .argument('<dest>', 'Destination database uri')
  .argument('[query]', 'Query used to get the data', Validator.object, {})
  .action(run);

async function run(srcUri: string, destUri: string, query: object, opts: Options): Promise<void> {
  const srcClient = await new MongoClient(srcUri).connect().catch(() => logger.error('Failed to connect to source database'));
  const destClient = await new MongoClient(destUri).connect().catch(() => logger.error('Failed to connect to destination database'));
  const srcDb = srcClient.db();
  const destDb = destClient.db();
  logger.info('connected to databases');

  if (opts.drop) {
    if (!opts.dryRun) await destDb.dropDatabase();
    logger.info(`destination database '${destDb.databaseName}' dropped`);
  }

  const srcCollections =
    opts.collection.length > 0 ? opts.collection.map((collectionName) => srcDb.collection(collectionName)) : await srcDb.collections();
  for (const srcCollection of srcCollections) {
    const documentCount = await srcCollection.estimatedDocumentCount();
    const batchCount = Math.ceil(documentCount / opts.batchSize);
    const destCollection = destDb.collection(srcCollection.collectionName);
    for (let index = 0; index < batchCount; index++) {
      const documents = await srcCollection.find(query, { skip: index * opts.batchSize, limit: opts.batchSize }).toArray();
      if (!opts.dryRun) await destCollection.insertMany(documents);
    }
    logger.info(`migrated ${documentCount} documents in '${srcCollection.collectionName}' collection`);
  }

  srcClient.close();
  destClient.close();
  logger.info('migration complete');
}

export const migrate = command;
export default command;
