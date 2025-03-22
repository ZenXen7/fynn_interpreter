export enum TokenType {
    
    SUGOD = 'SUGOD',
    KATAPUSAN = 'KATAPUSAN',
    MUGNA = 'MUGNA',
    NUMERO = 'NUMERO',
    LETRA = 'LETRA',
    TINUOD = 'TINUOD',
    TIPIK = 'TIPIK',
    IPAKITA = 'IPAKITA',
    DAWAT = 'DAWAT',
    KUNG = 'KUNG',
    KUNG_WALA = 'KUNG WALA',
    KUNG_DILI = 'KUNG DILI',
    ALANG_SA = 'ALANG SA',
    PUNDOK = 'PUNDOK',
    UG = 'UG',
    O = 'O',
    DILI = 'DILI',
    
  
    PLUS = '+',
    MINUS = '-',
    MULTIPLY = '*',
    DIVIDE = '/',
    MODULO = '%',
    GREATER = '>',
    LESS = '<',
    GREATER_EQUAL = '>=',
    LESS_EQUAL = '<=',
    EQUAL = '==',
    NOT_EQUAL = '<>',
    AND = 'UG',
    OR = 'O',
    NOT = 'DILI',
    ASSIGN = '=',
    
  
    NEWLINE = '$',
    CONCAT = '&',
    ESCAPE = '[]',
    
   
    IDENTIFIER = 'IDENTIFIER',
    NUMBER = 'NUMBER',
    STRING = 'STRING',
    CHAR = 'CHAR',
    BOOLEAN = 'BOOLEAN',
    COMMA = ',',
    SEMICOLON = ';',
    COLON = ':',
    LEFT_PAREN = '(',
    RIGHT_PAREN = ')',
    LEFT_BRACE = '{',
    RIGHT_BRACE = '}',
    EOF = 'EOF',
    HASH = 'HASH'
}

export interface Token {
    type: TokenType;
    lexeme: string;
    literal: any;
    line: number;
    column: number;
}

export interface Variable {
    type: TokenType;
    value: any;
}

export interface Environment {
    variables: Map<string, Variable>;
    parent?: Environment;
}

export interface ASTNode {
    type: string;
    line: number;
    column: number;
}

export interface BinaryExpr extends ASTNode {
    left: ASTNode;
    operator: Token;
    right: ASTNode;
}

export interface UnaryExpr extends ASTNode {
    operator: Token;
    right: ASTNode;
}

export interface LiteralExpr extends ASTNode {
    value: any;
}

export interface VariableExpr extends ASTNode {
    name: Token;
}

export interface AssignExpr extends ASTNode {
    name: Token;
    value: ASTNode;
}

export interface VarDeclStmt extends ASTNode {
    varType: Token;  
    names: Token[];  
    initializer?: ASTNode;  
}

export interface PrintStmt extends ASTNode {
    type: 'PrintStmt';
    value: ASTNode;
    line: number;
    column: number;
}

export interface BlockStmt extends ASTNode {
    statements: ASTNode[];
}

export interface IfStmt extends ASTNode {
    condition: ASTNode;
    thenBranch: BlockStmt;
    elseBranch?: BlockStmt;
}

export interface ForStmt extends ASTNode {
    initializer: ASTNode;
    condition: ASTNode;
    increment: ASTNode;
    body: BlockStmt;
}