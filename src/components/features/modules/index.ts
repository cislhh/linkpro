/**
 * Page Module Components
 *
 * Export all module components for use in the page editor and public pages.
 *
 * Requirements: 11.1
 */

export { LinksModule } from "./links-module";
export { BioModule } from "./bio-module";
export { SkillsModule } from "./skills-module";
export { ProjectsModule } from "./projects-module";
export { ModuleSelector } from "./module-selector";
export { ModuleList } from "./module-list";
export { ModuleEditDialog } from "./module-edit-dialog";

// Re-export types for convenience
export type { PageModule, ModuleType, ModuleData } from "@/types";
