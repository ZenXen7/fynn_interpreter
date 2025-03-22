import { Token, TokenType, ASTNode, BinaryExpr, UnaryExpr, LiteralExpr, VariableExpr, AssignExpr, VarDeclStmt, PrintStmt, BlockStmt, IfStmt, ForStmt } from './types';

export class ParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ParseError';
    }
}

export class Parser {
    private tokens: Token[] = [];
    private current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    public parse(): ASTNode[] {
        const statements: ASTNode[] = [];
        
       
        this.consume(TokenType.SUGOD, "Expect 'SUGOD' at start of program.");
        
        
        while (!this.check(TokenType.KATAPUSAN) && !this.isAtEnd()) {
            statements.push(this.declaration());
        }
        
       
        this.consume(TokenType.KATAPUSAN, "Expect 'KATAPUSAN' at end of program.");
        
        return statements;
    }

    private isStatementStart(): boolean {
        const token = this.peek();
        return token.type === TokenType.MUGNA ||
               token.type === TokenType.IPAKITA ||
               token.type === TokenType.KUNG ||
               token.type === TokenType.ALANG_SA ||
               token.type === TokenType.IDENTIFIER;
    }

    private declaration(): ASTNode {
        try {
            if (this.match(TokenType.MUGNA)) {
                return this.varDeclaration();
            }
            return this.statement();
        } catch (error) {
            this.synchronize();
            throw error;
        }
    }

    private varDeclaration(): ASTNode {
        const startToken = this.previous();
        const type = this.advance(); 
    
        if (![TokenType.NUMERO, TokenType.LETRA, TokenType.TINUOD, TokenType.TIPIK].includes(type.type)) {
            throw new ParseError(`Expected type after 'MUGNA', got ${type.type}`);
        }
    
       
        const names: Token[] = [];
        do {
            names.push(this.consume(TokenType.IDENTIFIER, "Expect variable name."));
        } while (this.match(TokenType.COMMA));
    
        let initializer: ASTNode | undefined;
        if (this.match(TokenType.ASSIGN)) {
            initializer = this.expression();
        }
    
        return {
            type: 'VarDeclStmt',
            line: startToken.line,
            column: startToken.column,
            varType: type,
            names: names,  
            initializer: initializer
        } as VarDeclStmt;
    }
    
    

    private statement(): ASTNode {
        if (this.match(TokenType.IPAKITA)) {
            return this.printStatement();
        }
        if (this.match(TokenType.MUGNA)) {
            return this.varDeclaration();
        }
        if (this.match(TokenType.KUNG)) {
            return this.ifStatement();
        }
        if (this.match(TokenType.ALANG_SA)) {
            return this.forStatement();
        }
        if (this.match(TokenType.PUNDOK)) {
            return this.blockStatement();
        }
        return this.expressionStatement();
    }

    private printStatement(): ASTNode {
        const keyword = this.previous();
        this.consume(TokenType.COLON, "Expect ':' after 'IPAKITA'"); 
        const value = this.expression(); 
        
        return {
            type: 'PrintStmt',
            line: keyword.line,
            column: keyword.column,
            value: value
        } as PrintStmt;
    }
    
    private ifStatement(): ASTNode {
        const condition = this.expression();
        const thenBranch = this.blockStatement();
        let elseBranch: BlockStmt | undefined;

        if (this.match(TokenType.KUNG_DILI)) {
            elseBranch = this.blockStatement();
        } else if (this.match(TokenType.KUNG_WALA)) {
            elseBranch = this.blockStatement();
        }

        return {
            type: 'IfStmt',
            line: this.previous().line,
            column: this.previous().column,
            condition: condition,
            thenBranch: thenBranch,
            elseBranch: elseBranch
        } as IfStmt;
    }

    private forStatement(): ASTNode {
        const initializer = this.expression();
        this.consume(TokenType.COMMA, "Expect ',' after initializer.");
        const condition = this.expression();
        this.consume(TokenType.COMMA, "Expect ',' after condition.");
        const increment = this.expression();
        const body = this.blockStatement();

        return {
            type: 'ForStmt',
            line: this.previous().line,
            column: this.previous().column,
            initializer: initializer,
            condition: condition,
            increment: increment,
            body: body
        } as ForStmt;
    }

    private blockStatement(): BlockStmt {
        const statements: ASTNode[] = [];
        this.consume(TokenType.LEFT_BRACE, "Expect '{' before block.");
        
        while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            statements.push(this.declaration());
        }

        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
        return {
            type: 'BlockStmt',
            line: this.previous().line,
            column: this.previous().column,
            statements: statements
        } as BlockStmt;
    }

    private expressionStatement(): ASTNode {
        const expr = this.expression();
        return expr;
    }

    private expression(): ASTNode {
        let expr = this.assignment();
    
        while (this.match(TokenType.CONCAT)) { 
            const operator = this.previous();
            const right = this.assignment();
            expr = {
                type: 'BinaryExpr',
                line: operator.line,
                column: operator.column,
                left: expr,
                operator: operator,
                right: right
            } as BinaryExpr;
        }
    
        return expr;
    }
    

    private assignment(): ASTNode {
        const expr = this.primary();

        if (this.match(TokenType.ASSIGN)) {
            const value = this.expression();
            if (expr.type === 'VariableExpr') {
                return {
                    type: 'AssignExpr',
                    line: expr.line,
                    column: expr.column,
                    name: (expr as VariableExpr).name,
                    value: value
                } as AssignExpr;
            }
            throw new ParseError("Invalid assignment target.");
        }

        return expr;
    }

    private equality(): ASTNode {
        let expr = this.comparison();
        while (this.match(TokenType.EQUAL, TokenType.NOT_EQUAL)) {
            const operator = this.previous();
            const right = this.comparison();
            expr = {
                type: 'BinaryExpr',
                line: operator.line,
                column: operator.column,
                left: expr,
                operator: operator,
                right: right
            } as BinaryExpr;
        }
        return expr;
    }

    private comparison(): ASTNode {
        let expr = this.term();
        while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
            const operator = this.previous();
            const right = this.term();
            expr = {
                type: 'BinaryExpr',
                line: operator.line,
                column: operator.column,
                left: expr,
                operator: operator,
                right: right
            } as BinaryExpr;
        }
        return expr;
    }

    private term(): ASTNode {
        let expr = this.factor();
        while (this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.factor();
            expr = {
                type: 'BinaryExpr',
                line: operator.line,
                column: operator.column,
                left: expr,
                operator: operator,
                right: right
            } as BinaryExpr;
        }
        return expr;
    }

    private factor(): ASTNode {
        let expr = this.unary();
        while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO)) {
            const operator = this.previous();
            const right = this.unary();
            expr = {
                type: 'BinaryExpr',
                line: operator.line,
                column: operator.column,
                left: expr,
                operator: operator,
                right: right
            } as BinaryExpr;
        }
        return expr;
    }

    private unary(): ASTNode {
        if (this.match(TokenType.MINUS, TokenType.NOT)) {
            const operator = this.previous();
            const right = this.unary();
            return {
                type: 'UnaryExpr',
                line: operator.line,
                column: operator.column,
                operator: operator,
                right: right
            } as UnaryExpr;
        }
        return this.primary();
    }

    private primary(): ASTNode {
        if (this.match(TokenType.NUMERO, TokenType.LETRA, TokenType.TINUOD)) {
            return {
                type: 'LiteralExpr',
                line: this.previous().line,
                column: this.previous().column,
                value: this.previous().literal
            } as LiteralExpr;
        }
    
        if (this.match(TokenType.IDENTIFIER)) {
            return {
                type: 'VariableExpr',
                line: this.previous().line,
                column: this.previous().column,
                name: this.previous()
            } as VariableExpr;
        }
    
        console.error("Unexpected token:", this.peek());
        throw new ParseError(`Expect expression. Found: ${this.peek().type}`);
    }
    
    
    

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.peek().type === TokenType.EOF;
    }

    private peek(): Token {
        return this.tokens[this.current];
    }

    private previous(): Token {
        return this.tokens[this.current - 1];
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw new ParseError(message);
    }

    
    private synchronize(): void {
        this.advance();
        while (!this.isAtEnd()) {
            if (this.previous().type === TokenType.KATAPUSAN) return;
            switch (this.peek().type) {
                case TokenType.MUGNA:
                case TokenType.IPAKITA:
                    return;
            }
            this.advance();
        }
    }
}