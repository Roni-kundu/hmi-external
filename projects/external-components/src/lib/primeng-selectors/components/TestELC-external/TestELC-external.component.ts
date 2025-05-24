import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

/*
  Features:
  - Toolbar with draggable electrical components (resistor, capacitor, inductor, battery, switch, single-phase & 3-phase supply).
  - Drag-and-drop to canvas for circuit building.
  - Toggle between single-phase and 3-phase power supply.
  - "Test" button to check the circuit; displays error if detected (basic placeholder logic).
  - Strict typing for all variables.
*/

type ElectricalComponentType = 'resistor' | 'capacitor' | 'inductor' | 'battery' | 'switch' | 'single-phase' | 'three-phase';

interface CircuitComponent {
  id: number;
  type: ElectricalComponentType;
  x: number;
  y: number;
}

@Component({
  selector: 'app-test-elc',
  template: `
    <div class="elc-container">
      <div class="toolbar">
        <div
          *ngFor="let comp of availableComponents"
          class="tool-item"
          draggable="true"
          (dragstart)="onDragStart($event, comp.type)">
          {{ comp.label }}
        </div>
        <button (click)="togglePowerSupply()" class="power-btn">
          Use {{ useThreePhase ? 'Single Phase' : '3 Phase' }} Supply
        </button>
        <button (click)="testCircuit()">Test Circuit</button>
      </div>
      <div class="canvas"
           (dragover)="allowDrop($event)"
           (drop)="onDrop($event)">
        <div *ngFor="let comp of placedComponents"
             class="component"
             [style.left.px]="comp.x"
             [style.top.px]="comp.y">
          {{ getComponentLabel(comp.type) }}
        </div>
      </div>
      <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
    </div>
  `,
  styles: [`
    .elc-container { width: 100%; height: 100%; display: flex; flex-direction: column; }
    .toolbar { background: #f4f4f4; padding: 10px; display: flex; gap: 12px; align-items: center; }
    .tool-item { padding: 6px 14px; background: #dbeafe; border: 1px solid #90cdf4; border-radius: 4px; cursor: grab; user-select: none; }
    .power-btn { margin-left: auto; background: #fff7ae; border: 1px solid #e5d700; border-radius: 4px; padding: 6px 14px; }
    .canvas { flex: 1; border: 1px solid #ccc; position: relative; margin-top: 10px; min-height: 420px; background: #fafbfc; }
    .component { position: absolute; padding: 7px 16px; background: #e3e3ff; border-radius: 4px; border: 1px solid #888; cursor: pointer; user-select: none; font-size: 15px; }
    .error-msg { color: #b91c1c; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 4px; padding: 8px; margin: 12px 0 0 0; text-align: center; }
  `]
})
export class TestELCComponent extends CommonExternalComponent {
  availableComponents: Array<{ type: ElectricalComponentType; label: string }> = [
    { type: 'resistor', label: 'Resistor' },
    { type: 'capacitor', label: 'Capacitor' },
    { type: 'inductor', label: 'Inductor' },
    { type: 'battery', label: 'Battery' },
    { type: 'switch', label: 'Switch' },
    { type: 'single-phase', label: 'Single Phase Supply' },
    { type: 'three-phase', label: '3 Phase Supply' }
  ];

  placedComponents: CircuitComponent[] = [];
  draggedType: ElectricalComponentType | null = null;
  componentCounter: number = 0;
  useThreePhase: boolean = false;
  errorMsg: string = '';

  onDragStart(event: DragEvent, type: ElectricalComponentType): void {
    this.draggedType = type;
    if (event.dataTransfer) {
      event.dataTransfer.setData('componentType', type);
    }
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const canvasRect = (event.target as HTMLElement).getBoundingClientRect();
    const x: number = event.clientX - canvasRect.left;
    const y: number = event.clientY - canvasRect.top;
    let type: ElectricalComponentType | null = this.draggedType;

    // For safety, also check dataTransfer
    if (!type && event.dataTransfer) {
      type = event.dataTransfer.getData('componentType') as ElectricalComponentType;
    }

    if (type) {
      // Only one power supply allowed at a time
      if ((type === 'single-phase' || type === 'three-phase') &&
          this.placedComponents.some(c => c.type === 'single-phase' || c.type === 'three-phase')) {
        this.errorMsg = 'Only one power supply allowed per circuit!';
        return;
      }
      this.placedComponents.push({
        id: ++this.componentCounter,
        type,
        x,
        y
      });
      this.errorMsg = '';
    }
    this.draggedType = null;
  }

  togglePowerSupply(): void {
    this.useThreePhase = !this.useThreePhase;
  }

  testCircuit(): void {
    // Basic error detection logic
    const hasPower = this.placedComponents.some(c =>
      this.useThreePhase ? c.type === 'three-phase' : c.type === 'single-phase'
    );
    if (!hasPower) {
      this.errorMsg = `No ${this.useThreePhase ? '3 phase' : 'single phase'} power supply found!`;
      return;
    }
    if (this.placedComponents.length < 2) {
      this.errorMsg = 'Add more components to form a valid circuit!';
      return;
    }
    // Example: check for isolated components (not connected - placeholder)
    // Real connection logic would require wire/component linking
    this.errorMsg = '';
    alert('Circuit test passed (placeholder)!');
  }

  getComponentLabel(type: ElectricalComponentType): string {
    const found = this.availableComponents.find(c => c.type === type);
    return found ? found.label : type;
  }
}