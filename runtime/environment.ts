import { MK_BOOL, MK_NULL, RuntimeVal } from "./values";

function setupScope(env: Environment) {
  env.declarevar("null", MK_NULL(), true);
  env.declarevar("true", MK_BOOL(true), true);
  env.declarevar("false", MK_BOOL(false), true);
}

export default class Environment {
  private parent?: Environment;
  private constants: Set<string> = new Set();
  private variables: Map<string, RuntimeVal> = new Map();
  constructor(parentEnv?: Environment) {
    const global = parentEnv ? false : true;
    this.parent = parentEnv;
    if (global) {
      setupScope(this);
    }
  }

  public declarevar(
    varname: string,
    value: RuntimeVal,
    constant: boolean
  ): RuntimeVal {
    if (this.variables.has(varname)) {
      throw `Cannot declare variable ${varname}. As it already is defined.`;
    }
    this.variables.set(varname, value);
    if (constant) {
      this.constants.add(varname);
    }
    return value;
  }

  public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);
    if (env.constants.has(varname)) {
      console.error(
        `Cannot reasign to variable ${varname} as it was declared existed`
      );
      process.exit(0);
    }
    env.variables.set(varname, value);
    return value;
  }

  public lookupVar(varname: string): RuntimeVal {
    const env = this.resolve(varname);
    return env.variables.get(varname)!;
  }

  public resolve(varname: string): Environment {
    if (this.variables.has(varname)) {
      return this;
    }
    if (this.parent === undefined) {
      throw `Cannot resolve '${varname}' as it does not exist`;
    }
    return this.parent.resolve(varname);
  }
}
