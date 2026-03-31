import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLoggerService {
  log(message: string, context = 'APP') {
    new Logger(context).log(message);
  }

  error(message: string, trace?: string, context = 'APP') {
    new Logger(context).error(message, trace);
  }

  warn(message: string, context = 'APP') {
    new Logger(context).warn(message);
  }

  debug(message: string, context = 'APP') {
    new Logger(context).debug(message);
  }

  verbose(message: string, context = 'APP') {
    new Logger(context).verbose(message);
  }

  http(message: string) {
    new Logger('HTTPLogging').log(message);
  }
  // deposit watcher
  watcher(message: string) {
    new Logger('WATCHER').log(message);
  }

  deposit(message: string) {
    new Logger('DEPOSIT').log(message);
  }

  withdraw(message: string) {
    new Logger('WITHDRAW').log(message);
  }

  callback(message: string) {
    new Logger('CALLBACK').log(message);
  }
}
