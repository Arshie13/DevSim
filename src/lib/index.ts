// place files you want to import through the `$lib` alias in this folder.
import { TerminalInitializer } from "./client/TerminalInitializer";
import type { LevelConfig, Task } from "./interface/LevelConfig";
import { LEVEL_CONFIG } from "./mockdata/mocklevel";

export { TerminalInitializer, type LevelConfig, type Task, LEVEL_CONFIG };
