import { Token, TokenType } from './types';

export class Lexer {
    private static keywords: Record<string, TokenType> = {
        'SUGOD': TokenType.SUGOD,
        'KATAPUSAN': TokenType.KATAPUSAN,
        'MUGNA': TokenType.MUGNA,
        'IPAKITA': TokenType.IPAKITA,
        'DAWAT': TokenType.DAWAT,
        'UG': TokenType.UG,
        'O': TokenType.O,
        'DILI': TokenType.DILI,
        'KUNG': TokenType.KUNG,
        'KUNG WALA': TokenType.KUNG_WALA,
        'KUNG DILI': TokenType.KUNG_DILI,
        'PUNDOK': TokenType.PUNDOK,
        'ALANG SA': TokenType.ALANG_SA,
        'NUMERO': TokenType.NUMERO,
        'LETRA': TokenType.LETRA,
        'TINUOD': TokenType.TINUOD,
        'TIPIK': TokenType.TIPIK,
        'OO': TokenType.BOOLEAN,
    };

    private source: string;
    private tokens: Token[] = [];
    private start: number = 0;
    private current: number = 0;
    private line: number = 1;
    private column: number = 1;

    constructor(source: string) {
        this.source = source;
    }

    scanTokens(): Token[] {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push({
            type: TokenType.EOF,
            lexeme: '',
            literal: null,
            line: this.line,
            column: this.column
        });

        return this.tokens;
    }

    private scanToken(): void {
        const c = this.advance();
        switch (c) {
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case ':': this.addToken(TokenType.COLON); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case ',':
            this.addToken(TokenType.COMMA);
            break;

            case '&':
            this.addToken(TokenType.CONCAT);
            break;

            case "'":
                    this.charLiteral();
                    break;
            case '-': 
            if (this.match('-')) {
                
                while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();

                
                if (this.peek() === '\n') {
                    this.advance();
                    this.line++;
                    this.column = 1;
                }
            } else {
                this.addToken(TokenType.MINUS);
            }
            break;

            case '*': this.addToken(TokenType.MULTIPLY); break;
            case '/': this.addToken(TokenType.DIVIDE); break;
            case '=':
                if (this.match('=')) {
                    this.addToken(TokenType.EQUAL);
                } else {
                    this.addToken(TokenType.ASSIGN);
                }
                break;
            case '>': this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;
            case '<': this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS); break;
            case '!':
                if (this.match('=')) {
                    this.addToken(TokenType.NOT_EQUAL);
                } else {
                    throw new Error(`Unexpected character '!' at line ${this.line}, column ${this.column}`);
                }
                break;
            case ' ':
            case '\r':
            case '\t':
                break;
            case '\n':
                this.line++;
                this.column = 1;
                break;
            case '"':
                this.string();
                break;
            default:
                if (this.isDigit(c)) {
                    this.number();
                } else if (this.isAlpha(c)) {
                    this.identifier();
                } else {
                    throw new Error(`Unexpected character '${c}' at line ${this.line}, column ${this.column}`);
                }
        }
    }
    private charLiteral(): void {
        if (this.isAtEnd() || this.peek() === '\n') {
            throw new Error(`Unterminated character at line ${this.line}, column ${this.column}`);
        }
    
        const char = this.advance(); 
    
        if (this.peek() !== "'") {
            throw new Error(`Invalid character literal at line ${this.line}, column ${this.column}`);
        }
        
        this.advance(); 
    
        this.addToken(TokenType.LETRA, char);
    }
    

    private string(): void {
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === '\n') this.line++;
            this.advance();
        }

        if (this.isAtEnd()) {
            throw new Error(`Unterminated string at line ${this.line}, column ${this.column}`);
        }

        this.advance();
        const value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.LETRA, value);
    }

    private identifier(): void {
        while (this.isAlphaNumeric(this.peek())) this.advance();
        const text = this.source.substring(this.start, this.current);
        const type = Lexer.keywords[text] || TokenType.IDENTIFIER;
        this.addToken(type);
    }

    private number(): void {
        while (this.isDigit(this.peek())) this.advance();
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            this.advance();
            while (this.isDigit(this.peek())) this.advance();
            this.addToken(TokenType.TIPIK, parseFloat(this.source.substring(this.start, this.current)));
        } else {
            this.addToken(TokenType.NUMERO, parseInt(this.source.substring(this.start, this.current)));
        }
    }

    private match(expected: string): boolean {
        if (this.isAtEnd()) return false;
        if (this.source[this.current] !== expected) return false;
        this.current++;
        this.column++;
        return true;
    }

    private peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.source[this.current];
    }

    private peekNext(): string {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source[this.current + 1];
    }

    private isAlpha(c: string): boolean {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
    }

    private isAlphaNumeric(c: string): boolean {
        return this.isAlpha(c) || this.isDigit(c);
    }

    private isDigit(c: string): boolean {
        return c >= '0' && c <= '9';
    }

    private isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

    private advance(): string {
        const c = this.source[this.current++];
        this.column++;
        return c;
    }

    private addToken(type: TokenType, literal: any = null): void {
        const text = this.source.substring(this.start, this.current);
        this.tokens.push({
            type,
            lexeme: text,
            literal,
            line: this.line,
            column: this.column - text.length
        });
    }
}