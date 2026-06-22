/**
 * IReconciliationRepository - Interfaz de Dominio
 * Define las operaciones de persistencia para los datos de conciliación.
 */
export interface IReconciliationRepository {
  save(data: any): Promise<any>;
}