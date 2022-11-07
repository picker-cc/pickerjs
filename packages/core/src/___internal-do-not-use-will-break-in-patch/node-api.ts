import {SchemaConfig} from "../schema/types";
import {createSystem} from "../createSystem";
import {initConfig} from "../schema/initConfig";

export function createQueryAPI(config: SchemaConfig, prismaClient: any) {
  const { getPicker } = createSystem(initConfig(config));
  const picker = getPicker(prismaClient);
  picker.connect();
  return picker.createContext({ sudo: true }).query;
}
