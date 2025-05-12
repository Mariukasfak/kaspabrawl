/**
 * Entity class for the Entity Component System architecture
 * Represents a game object that can have multiple components attached to it
 */
export class Entity {
  public readonly id: string;
  private components: Map<string, Component>;
  
  constructor(id: string) {
    this.id = id;
    this.components = new Map();
  }
  
  /**
   * Add a component to this entity
   */
  public addComponent<T extends Component>(component: T): this {
    this.components.set(component.type, component);
    return this;
  }
  
  /**
   * Remove a component from this entity
   */
  public removeComponent(componentType: string): boolean {
    return this.components.delete(componentType);
  }
  
  /**
   * Check if this entity has a component of the specified type
   */
  public hasComponent(componentType: string): boolean {
    return this.components.has(componentType);
  }
  
  /**
   * Get a component of the specified type
   */
  public getComponent<T extends Component>(componentType: string): T | undefined {
    return this.components.get(componentType) as T | undefined;
  }
  
  /**
   * Get all component types this entity has
   */
  public getComponentTypes(): string[] {
    return Array.from(this.components.keys());
  }
  
  /**
   * Get all components attached to this entity
   */
  public getAllComponents(): Component[] {
    return Array.from(this.components.values());
  }
}

/**
 * Component interface for the Entity Component System architecture
 * Components are pure data containers with no behavior
 */
export interface Component {
  readonly type: string;
}

/**
 * System interface for the Entity Component System architecture
 * Systems contain the logic that operates on entities with specific components
 */
export interface System {
  update(world: World): void;
}

/**
 * World class for the Entity Component System architecture
 * Manages all entities and systems in the game world
 */
export class World {
  private entities: Map<string, Entity>;
  private systems: System[];
  private nextEntityId: number;
  
  constructor() {
    this.entities = new Map();
    this.systems = [];
    this.nextEntityId = 1;
  }
  
  /**
   * Create a new entity with a unique ID
   */
  public createEntity(): Entity {
    const id = `entity_${this.nextEntityId++}`;
    const entity = new Entity(id);
    this.entities.set(id, entity);
    return entity;
  }
  
  /**
   * Add an existing entity to the world
   */
  public addEntity(entity: Entity): this {
    this.entities.set(entity.id, entity);
    return this;
  }
  
  /**
   * Remove an entity from the world by ID
   */
  public removeEntity(entityId: string): boolean {
    return this.entities.delete(entityId);
  }
  
  /**
   * Get an entity by ID
   */
  public getEntity(entityId: string): Entity | undefined {
    return this.entities.get(entityId);
  }
  
  /**
   * Get all entities
   */
  public getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }
  
  /**
   * Add a system to the world
   */
  public addSystem(system: System): this {
    this.systems.push(system);
    return this;
  }
  
  /**
   * Remove a system from the world
   */
  public removeSystem(system: System): boolean {
    const index = this.systems.indexOf(system);
    if (index !== -1) {
      this.systems.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * Update all systems, passing the world to each system
   */
  public update(): void {
    for (const system of this.systems) {
      system.update(this);
    }
  }
  
  /**
   * Get all entities that have all of the specified component types
   */
  public getEntitiesByComponents(componentTypes: string[]): Entity[] {
    return this.getAllEntities().filter(entity => {
      return componentTypes.every(type => entity.hasComponent(type));
    });
  }
}

export default { Entity, World, Component, System };
