# BISAYA++ Interpreter

An interpreter for the BISAYA++ programming language, a Cebuano-based programming language designed to teach Cebuanos the basics of programming.

## Features

- Strongly-typed high-level interpreted language
- Cebuano-based keywords and syntax
- Support for basic data types (NUMERO, LETRA, TINUOD, TIPIK)
- Arithmetic and logical operations
- Control flow structures (KUNG, ALANG SA)
- Input/Output operations

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Run the interpreter:
```bash
npm start
```

## Sample Program

```
SUGOD
MUGNA NUMERO x, y, z=5
MUGNA LETRA a_1='n'
MUGNA TINUOD t="OO"
x=y=4
a_1='c' -- this is a comment
IPAKITA: x & t & z & $ & a_1 & [#] & "last"
KATAPUSAN
```

## Language Features

- Variable declarations with MUGNA
- Comments with --
- Case-sensitive variable names
- Reserved words in capital letters
- Special characters:
  - $ for newline
  - & for concatenation
  - [] for escape codes

## Data Types

1. NUMERO - Integer numbers
2. LETRA - Single character
3. TINUOD - Boolean values ("OO" or "DILI")
4. TIPIK - Decimal numbers

## License

MIT 