var currentJson = null;
var autoFormatTimer = null;
var activeOutputId = 'output';

var SQL_RESERVED = {
  select: true, from: true, where: true, table: true, group: true, order: true, by: true,
  insert: true, update: true, delete: true, create: true, drop: true, alter: true, join: true,
  index: true, primary: true, foreign: true, key: true, references: true, user: true
};

var PY_RESERVED = {
  false: true, none: true, true: true, and: true, as: true, assert: true, async: true,
  await: true, break: true, class: true, continue: true, def: true, del: true, elif: true,
  else: true, except: true, finally: true, for: true, from: true, global: true, if: true,
  import: true, in: true, is: true, lambda: true, nonlocal: true, not: true, or: true,
  pass: true, raise: true, return: true, try: true, while: true, with: true, yield: true
};

var JAVA_RESERVED = {
  abstract: true, assert: true, boolean: true, break: true, byte: true, case: true,
  catch: true, char: true, class: true, const: true, continue: true, default: true,
  do: true, double: true, else: true, enum: true, extends: true, final: true,
  finally: true, float: true, for: true, goto: true, if: true, implements: true,
  import: true, instanceof: true, int: true, interface: true, long: true, native: true,
  new: true, package: true, private: true, protected: true, public: true, return: true,
  short: true, static: true, strictfp: true, super: true, switch: true, synchronized: true,
  this: true, throw: true, throws: true, transient: true, try: true, void: true,
  volatile: true, while: true
};

var GO_RESERVED = {
  break: true, default: true, func: true, interface: true, select: true, case: true,
  defer: true, go: true, map: true, struct: true, chan: true, else: true, goto: true,
  package: true, switch: true, const: true, fallthrough: true, if: true, range: true,
  type: true, continue: true, for: true, import: true, return: true, var: true
};

