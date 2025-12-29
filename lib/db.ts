import { supabaseAdmin } from "./supabase"

export interface CustomerData {
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  address?: string
}

export interface OrderData {
  order_id?: string
  customer_id?: string
  plan: string
  billing_frequency: string
  amount?: number
  status?: string
  subscription_id?: string
  next_charge_date?: string | Date // ISO date string or Date object
  last_payment_date?: string | Date // ISO date string or Date object
  reservation_with?: string
  number_of_people?: number
  preferred_day?: string
  preferred_time?: string
  start_date_option?: string
  additional_info?: string
}

export interface PaymentData {
  order_id: string
  transaction_id?: string
  subscription_id?: string
  charge_number?: number
  status: string
  amount?: number
  currency?: string
  is_recurring?: boolean
  webhook_data?: any
}

/**
 * Create or get customer by email
 */
export async function createOrGetCustomer(data: CustomerData) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not configured")
  }

  // Check if customer exists
  const { data: existingCustomer, error: checkError } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("email", data.email)
    .single()

  if (existingCustomer) {
    // Update existing customer
    const { data: updatedCustomer, error: updateError } = await supabaseAdmin
      .from("customers")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number || null,
        address: data.address || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingCustomer.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating customer:", updateError)
      throw updateError
    }

    return updatedCustomer
  } else {
    // Create new customer
    const { data: newCustomer, error: createError } = await supabaseAdmin
      .from("customers")
      .insert([data])
      .select()
      .single()

    if (createError) {
      console.error("Error creating customer:", createError)
      throw createError
    }

    return newCustomer
  }
}

/**
 * Create order
 */
export async function createOrder(data: OrderData) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not configured")
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error("Error creating order:", error)
    throw error
  }

  return order
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: string, transactionId?: string) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not configured")
  }

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .update(updateData)
    .eq("order_id", orderId)
    .select()
    .single()

  if (error) {
    console.error("Error updating order:", error)
    throw error
  }

  return order
}

/**
 * Update order with subscription details
 */
export async function updateOrder(orderId: string, data: Partial<OrderData & { subscription_id?: string }>) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not configured")
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId)
    .select()
    .single()

  if (error) {
    console.error("Error updating order:", error)
    throw error
  }

  return order
}

/**
 * Get order by order_id
 */
export async function getOrderByOrderId(orderId: string) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not configured")
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .single()

  if (error) {
    // Return null if order doesn't exist (instead of throwing)
    if (error.code === "PGRST116") {
      return null
    }
    console.error("Error fetching order:", error)
    throw error
  }

  return order
}

/**
 * Create payment record
 */
export async function createPayment(data: PaymentData) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not configured")
  }

  const { data: payment, error } = await supabaseAdmin
    .from("payments")
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error("Error creating payment:", error)
    throw error
  }

  return payment
}

/**
 * Update payment record
 */
export async function updatePayment(transactionId: string, data: Partial<PaymentData>) {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not configured")
  }

  const { data: payment, error } = await supabaseAdmin
    .from("payments")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("transaction_id", transactionId)
    .select()
    .single()

  if (error) {
    console.error("Error updating payment:", error)
    throw error
  }

  return payment
}

