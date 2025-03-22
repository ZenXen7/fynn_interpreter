import { Token, TokenType, ASTNode, BinaryExpr, UnaryExpr, LiteralExpr, VariableExpr, AssignExpr, VarDeclStmt, PrintStmt, BlockStmt, IfStmt, ForStmt, Environment, Variable } from './types';

export class RuntimeError extends Error {
    constructor(message: string, public token: Token) {
        super(message);
        this.name = 'RuntimeError';
    }
}

export class Interpreter {
    private environment: Environment;
    private output: string = '';

    constructor() {
        this.environment = {
            variables: new Map()
        };
    }

    interpret(statements: ASTNode[]): string {
        this.output = ''; 
        try {
            for (const statement of statements) {
                this.execute(statement);
            }
            return this.output;
        } catch (error: any) {
            if (error instanceof RuntimeError) {
                throw error;
            }
            throw new Error(`Unexpected error: ${error.message}`);
        }
    }

    private execute(node: ASTNode): any {
        switch (node.type) {
            case 'VarDeclStmt':
                return this.executeVarDecl(node as VarDeclStmt);
            case 'PrintStmt':
                return this.executePrint(node as PrintStmt);
            case 'BlockStmt':
                return this.executeBlock(node as BlockStmt);
            case 'IfStmt':
                return this.executeIf(node as IfStmt);
            case 'ForStmt':
                return this.executeFor(node as ForStmt);
            case 'BinaryExpr':
                return this.executeBinary(node as BinaryExpr);
            case 'UnaryExpr':
                return this.executeUnary(node as UnaryExpr);
            case 'LiteralExpr':
                return this.executeLiteral(node as LiteralExpr);
            case 'VariableExpr':
                return this.executeVariable(node as VariableExpr);
            case 'AssignExpr':
                return this.executeAssign(node as AssignExpr);
            default:
                throw new RuntimeError(`Unknown node type: ${node.type}`, { type: TokenType.EOF, lexeme: '', literal: null, line: node.line, column: node.column });
        }
    }

    private executeVarDecl(node: VarDeclStmt): any {
        let value: any;
        if (node.initializer) {
            value = this.execute(node.initializer);
        } else {
            switch (node.varType.type) {
                case TokenType.NUMERO:
                    value = 0;
                    break;
                case TokenType.LETRA:
                    value = '\0';
                    break;
                case TokenType.TINUOD:
                    value = false;
                    break;
                case TokenType.TIPIK:
                    value = 0.0;
                    break;
                default:
                    throw new RuntimeError(`Invalid type: ${node.varType.type}`, node.varType);
            }
        }
    
      
        for (const nameToken of node.names) {
            this.environment.variables.set(nameToken.lexeme, {
                type: node.varType.type,
                value: value
            });
        }
    
        return value;
    }
    

    private executePrint(node: PrintStmt): void {
        const value = this.execute(node.value);
        const output = this.stringify(value);
        this.output += output;
    }

    public visitPrintStmt(stmt: PrintStmt): void {
        const value = this.execute(stmt.value);
        console.log(this.stringify(value));
    }

    private executeBlock(node: BlockStmt): any {
        const previousEnv = this.environment;
        this.environment = {
            variables: new Map(),
            parent: previousEnv
        };

        try {
            for (const statement of node.statements) {
                this.execute(statement);
            }
        } finally {
            this.environment = previousEnv;
        }
    }

    private executeIf(node: IfStmt): any {
        const condition = this.execute(node.condition);
        if (this.isTruthy(condition)) {
            return this.execute(node.thenBranch);
        } else if (node.elseBranch) {
            return this.execute(node.elseBranch);
        }
    }

    private executeFor(node: ForStmt): any {
        this.execute(node.initializer);
        while (this.isTruthy(this.execute(node.condition))) {
            this.execute(node.body);
            this.execute(node.increment);
        }
    }

    private executeBinary(node: BinaryExpr): any {
        const left = this.execute(node.left);
        const right = this.execute(node.right);

        switch (node.operator.type) {
            case TokenType.PLUS:
                return left + right;
            case TokenType.MINUS:
                return left - right;
            case TokenType.MULTIPLY:
                return left * right;
            case TokenType.DIVIDE:
                if (right === 0) {
                    throw new RuntimeError('Division by zero', node.operator);
                }
                return left / right;
            case TokenType.MODULO:
                return left % right;
            case TokenType.GREATER:
                return left > right;
            case TokenType.GREATER_EQUAL:
                return left >= right;
            case TokenType.LESS:
                return left < right;
            case TokenType.LESS_EQUAL:
                return left <= right;
            case TokenType.EQUAL:
                return this.isEqual(left, right);
            case TokenType.NOT_EQUAL:
                return !this.isEqual(left, right);
            case TokenType.AND:
                return this.isTruthy(left) && this.isTruthy(right);
            case TokenType.OR:
                return this.isTruthy(left) || this.isTruthy(right);
            case TokenType.CONCAT:
                return this.stringify(left) + this.stringify(right);
            default:
                throw new RuntimeError(`Invalid operator: ${node.operator.type}`, node.operator);
        }
    }

    private executeUnary(node: UnaryExpr): any {
        const right = this.execute(node.right);

        switch (node.operator.type) {
            case TokenType.MINUS:
                return -right;
            case TokenType.NOT:
                return !this.isTruthy(right);
            default:
                throw new RuntimeError(`Invalid operator: ${node.operator.type}`, node.operator);
        }
    }

    private executeLiteral(node: LiteralExpr): any {
        return node.value;
    }

    private executeVariable(node: VariableExpr): any {
        const variable = this.environment.variables.get(node.name.lexeme);
        if (!variable) {
            throw new RuntimeError(`Undefined variable: ${node.name.lexeme}`, node.name);
        }
        return variable.value;
    }

    private executeAssign(node: AssignExpr): any {
        const value = this.execute(node.value);
        const variable = this.environment.variables.get(node.name.lexeme);
        if (!variable) {
            throw new RuntimeError(`Undefined variable: ${node.name.lexeme}`, node.name);
        }
        variable.value = value;
        return value;
    }

    private isTruthy(value: any): boolean {
        if (value === null) return false;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0;
        if (typeof value === 'string') return value !== '';
        return true;
    }

    private isEqual(a: any, b: any): boolean {
        if (a === null && b === null) return true;
        if (a === null) return false;
        return a === b;
    }

    private stringify(value: any): string {
        if (value === null) return 'wala';
        if (typeof value === 'boolean') return value ? 'OO' : 'DILI';
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'string') {
            if (value === '$') return '\n';
            if (value === '#') return '#';
            return value;
        }
        return value.toString();
    }
}