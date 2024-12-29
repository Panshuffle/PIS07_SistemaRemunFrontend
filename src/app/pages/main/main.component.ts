import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormGroup, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // Add this import for ngModel
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

import { ApiService } from '../../services/api.service';
import { Empleado } from '../../interfaces/serverDTOs/empleado';
import { Observable } from 'rxjs';
import { Sueldo } from '../../interfaces/serverDTOs/sueldo';
import { MesAnioDTO } from '../../interfaces/mes-anio-dto';
import { SueldoEmpleado } from '../../interfaces/sueldo-empleado';
import { RegistrarEmpleado } from '../../interfaces/serverDTOs/registrar-empleado';
import { MessageModalComponent } from '../../components/message-modal/message-modal.component';
import { ModalMessageService } from '../../services/modal-message.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, MessageModalComponent], // Add FormsModule here
  templateUrl: './main.component.html'
})
export class MainComponent {
  @Output() searchChange = new EventEmitter<string>();

  // Add modal state and nuevo empleado properties
  isModalOpen: boolean = false;
  nuevoEmpleado: any = {
    nombre: '',
    CargasFamiliares: 0,
    isapre: 'Fonasa',
    afp: 'Modelo',
    tipoContrato: 'PLAZO',
    mes: '',
    sueldoBase: 0,
    horasExtra: 0
  };

  empleados: Empleado[] = [];
  sueldos: Sueldo[] = [];
  sueldosEmpleados: SueldoEmpleado[] = [];
  mes: number = 1;
  mesTxt: string = "Enero";
  anio: number = 2022;
  aux: number = 0;
  form: FormGroup;

  constructor(private apiService: ApiService,
              private router: Router,
              private fb:FormBuilder,
              private messageModal:ModalMessageService,
  )
  {
    this.form = this.fb.group({
      nombre: [''],
      cargaFamiliar: [''],
      isapre: [''],
      afp: [''],
      contrato: [''],
      mes: [''],
      sueldoBase: [''],
      horasExtra: ['']
    });
  }

  // Add modal functions
  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
    if (!this.isModalOpen) {
      // Reset form when closing
      this.nuevoEmpleado = {
        nombre: '',
        cargasFamiliares: 0,
        isapre: 'Fonasa',
        afp: 'Modelo',
        tipoContrato: 'PLAZO',
        mes: '',
        sueldoBase: 0,
        horasExtra: 0
      };
    }
  }

  submitEmpleado() {
    this.toggleModal();
  }

  // Rest of your existing code remains the same
  ngOnInit() {
    this.loadEmployees();
    this.loadSalaries();
    this.refreshMonthText();
  }

  prevMonth() {
    if(this.mes==1) {
      this.mes = 12;
      this.anio--;
    }
    else{this.mes--;}

    this.refreshMonthText();
    this.sueldosEmpleados = [];
    this.loadSalaries();
  }

  nextMonth() {
    if(this.mes==12) {
      this.mes = 1;
      this.anio++;
    }
    else {this.mes++;}
    this.refreshMonthText();
    this.sueldosEmpleados = [];
    this.loadSalaries();
  }

  loadEmployees() {
    this.empleados = [];
    this.apiService.getEmpleados().subscribe({
      next: (data) => {
        this.empleados = data
      },
      error: (error)=>{
        console.error('Error obteniendo empleados:', error);
      }
    })
  }

  async loadSalaries(): Promise<void> {

    try {
      this.sueldos = [];
      const response = await this.apiService.getSalarios(this.mes, this.anio);
      const processedSalaries = response.map(salary => ({
        mes: salary.mes,
        sueldoBase: salary.sueldoBase,
        sueldoFinal: salary.sueldoFinal,
        horasExtra: salary.horasExtra,
        idTrabajador: salary.idTrabajador
      }));

      this.sueldos = processedSalaries;

      this.empleados.forEach(employee => {
        this.sueldos.forEach(salary => {

          if(salary.idTrabajador == employee.idTrabajador) {
            const sueldoEmpleado = {
              nombre: employee.nombre,
              sueldoBase: salary.sueldoBase,
              sueldoFinal: salary.sueldoFinal
            }
            this.sueldosEmpleados[this.aux] = sueldoEmpleado;
            this.aux++;
          }
        })

      })
      this.aux = 0;
    } catch (error) {
      //nothing...
    }
  }

  refreshMonthText() {
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    this.mesTxt = meses[this.mes - 1] || "Mes inválido";
  }

  onSearchChange(event: Event | null): void {
    if (event && event.target instanceof HTMLInputElement) {
      const searchTerm = event.target.value;
      this.searchChange.emit(searchTerm);
    }
  }

  async searchEmployee(query: string): Promise<void> {
    if(!query) {
      this.loadEmployees();
      return;
    }

    try {
      const response = this.apiService.getEmpleadosQuery(query);
      const procesedEmployees = (await response).map(employee => ({
        nombre: employee.nombre,
        idTrabajador: employee.idTrabajador,
        CargasFamiliares: employee.CargasFamiliares,
        IsapreNombre: employee.IsapreNombre,
        AFPNombre: employee.AFPNombre,
        tipoContrato: employee.tipoContrato
      }));

      this.empleados = procesedEmployees;
    } catch (error) {
      console.log(error);
    }
  }

  calcularSueldosFinales() {
    this.apiService.calcularSueldosFinales(this.mes,this.anio).subscribe(
      (data) => {
        this.loadEmployees();
        this.loadSalaries();
        console.log(data);
      },
      (error) => {
        this.messageModal.showMessage("No hay sueldos registrados en este mes.", true);
      }
    )
  }

  cerrarSesion()
  {
    this.router.navigate(['/login'])
  }

  registrarEmpleado()
  {
    const registrarEmpleado: RegistrarEmpleado =
    {
      Nombre: this.form.value.nombre,
      CargasFamiliares: this.form.value.cargaFamiliar,
      IsapreNombre: this.form.value.isapre,
      AFPNombre: this.form.value.afp,
      TipoContrato: this.form.value.contrato,
      Mes: this.form.value.mes,
      SueldoBase: this.form.value.sueldoBase,
      HorasExtra: this.form.value.horasExtra
    }

    console.log(registrarEmpleado);

    this.apiService.registarEmpleado(registrarEmpleado).subscribe(
      (data) => {
        console.log(data);
        this.loadEmployees();
        this.loadSalaries();
      },
      (error) => {
        this.messageModal.showMessage('Falta información o hay campos inválidos. Intente nuevamente', true);
        console.log(error)
      }
    )
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
        this.messageModal.showMessage('Por favor sube un archivo Excel válido (.xls o .xlsx).', true);
        return;
      }

      try {
        await this.cargarExcel(file);
        this.messageModal.showMessage('El archivo se subió correctamente.', false);
        input.value = '';
        this.loadEmployees();
        this.loadSalaries();
      } catch (error) {
        this.messageModal.showMessage('Ocurrió un error al subir el archivo.', true);
        console.error(error);
        input.value = '';
      }
    }
  }

  async cargarExcel(file: File): Promise<void> {
    try
    {
      const formData = new FormData();
      formData.append('file', file);

      const response = this.apiService.uploadExcel(formData, this.mes, this.anio);

      console.log(response);
    }catch(error)
    {
      console.log(error);
    }

  }

}


