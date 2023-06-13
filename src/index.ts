#! /usr/bin/env node

/**
 * Importing npm packages
 */
import { program } from 'commander';

/**
 * Importing user defined packages
 */
import { migrate } from './commands/migrate';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

program.name('shadops').description('A CLI tool to handle web and data operations').version('0.0.1').addCommand(migrate);

program.parse();
