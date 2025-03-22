import { Lexer } from './lexer';
import { Parser } from './parser';
import { Interpreter } from './interpreter';
import * as readline from 'readline-sync';

export class BisayaInterpreter {
    private interpreter: Interpreter;

    constructor() {
        this.interpreter = new Interpreter();
    }

    runFile(path: string): void {
        try {
            const source = require('fs').readFileSync(path, 'utf8');
            this.run(source);
        } catch (error: any) {
            console.error(`Error reading file: ${error.message}`);
            process.exit(1);
        }
    }

    runPrompt(): void {
        console.log('Welcome to BISAYA++ Interpreter');
        console.log('Type "exit" to quit');
        console.log('Type "SUGOD" to start a program and "KATAPUSAN" to end it');

        let source = '';
        let inProgram = false;

        while (true) {
            const line = readline.question('> ');
            if (line.toLowerCase() === 'exit') {
                break;
            }

            if (line.trim() === 'SUGOD') {
                inProgram = true;
                source = line + '\n';
                continue;
            }

            if (line.trim() === 'KATAPUSAN') {
                inProgram = false;
                source += line + '\n';
                this.run(source);
                source = '';
                continue;
            }

            if (inProgram) {
                source += line + '\n';
            } else {
                console.log('Error: Program must start with SUGOD');
            }
        }
    }

    private run(source: string): void {
        try {
            const lexer = new Lexer(source);
            const tokens = lexer.scanTokens();
            const parser = new Parser(tokens);
            const statements = parser.parse();
            if (statements) {
                const output = this.interpreter.interpret(statements);
                if (output && output.trim()) {
                    console.log(output);
                }
            }
        } catch (error: any) {
            if (error.name === 'ParseError') {
                console.error(`Parse error: ${error.message}`);
            } else if (error.name === 'RuntimeError') {
                console.error(`Runtime error: ${error.message}`);
            } else {
                console.error(`Error: ${error.message}`);
            }
        }
    }
}

class Runtime {
    private interpreter = new Interpreter();
    private hadError = false;
    private hadRuntimeError = false;

    public run(source: string): void {
        this.hadError = false;
        this.hadRuntimeError = false;

        try {
            const lexer = new Lexer(source);
            const tokens = lexer.scanTokens();
            console.log('Tokens:', tokens);
            
            const parser = new Parser(tokens);
            const statements = parser.parse();

            if (!this.hadError && statements) {
                const output = this.interpreter.interpret(statements);
                if (output && output.trim()) {
                    console.log(output);
                }
            }
        } catch (error: any) {
            this.error(error);
        }
    }

    private error(error: Error): void {
        if (error.name === 'ParseError') {
            console.error(`Parse error: ${error.message}`);
            this.hadError = true;
        } else if (error.name === 'RuntimeError') {
            console.error(`Runtime error: ${error.message}`);
            this.hadRuntimeError = true;
        } else {
            console.error(`Error: ${error.message}`);
            this.hadError = true;
        }
    }
}


if (require.main === module) {
    const interpreter = new BisayaInterpreter();
    if (process.argv.length > 2) {
        interpreter.runFile(process.argv[2]);
    } else {
        interpreter.runPrompt();
    }
}