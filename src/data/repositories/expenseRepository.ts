import { db, type TravelDatabase } from '../db'
import type { Expense, ExpenseSplit } from '../../domain/types'

export class ExpenseRepository {
  private readonly database: TravelDatabase

  constructor(database: TravelDatabase = db) {
    this.database = database
  }

  async listByTrip(tripId: string): Promise<Expense[]> {
    return this.database.expenses.where('tripId').equals(tripId).sortBy('date')
  }

  async save(expense: Expense, splits: ExpenseSplit[]): Promise<void> {
    await this.database.transaction('rw', this.database.expenses, this.database.expenseSplits, async () => {
      await this.database.expenses.put(expense)
      await this.database.expenseSplits.where('expenseId').equals(expense.id).delete()
      await this.database.expenseSplits.bulkPut(splits)
    })
  }

  async listSplits(expenseId: string): Promise<ExpenseSplit[]> {
    return this.database.expenseSplits.where('expenseId').equals(expenseId).toArray()
  }
}
