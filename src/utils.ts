/**
 * Importing npm packages
 */
import { Command, InvalidArgumentError } from 'commander';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class Validator {
  static int(value: string) {
    const parsedValue = parseInt(value);
    if (isNaN(parsedValue)) throw new InvalidArgumentError(`It is not a valid integer`);
    return parsedValue;
  }

  static object(input: string) {
    try {
      const obj = eval(`"use strict"; (${input})`);
      return JSON.parse(JSON.stringify(obj));
    } catch (err) {
      throw new InvalidArgumentError(`It is not a valid Object`);
    }
  }
}

export class Logger {
  constructor(private readonly command: Command) {}

  debug(message: string): void {
    console.log(message);
  }

  info(message: string): void {
    console.log(message);
  }

  error(message: string, err?: any): never {
    this.command.error(message);
  }
}
