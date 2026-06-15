import { configureStore, Middleware } from '@reduxjs/toolkit'
import cartReducer, { saveCartToStorage } from './features/cart/cartSlice'

/** After every action, persist the cart items array to localStorage. */
const cartPersistenceMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  const result = next(action)
  saveCartToStorage(storeAPI.getState().cart.items)
  return result
}

export const makeStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(cartPersistenceMiddleware),
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']