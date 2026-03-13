// place files you want to import through the `$lib` alias in this folder.
import { TerminalInitializer } from "./client/TerminalInitializer";
import { MonacoInitializer } from "./client/MonacoInitializer";
import type { LevelConfig, Task } from "./interface/LevelConfig";
import { LEVEL_CONFIG } from "./mockdata/mocklevel";

export { TerminalInitializer, MonacoInitializer, type LevelConfig, type Task, LEVEL_CONFIG };
