import { Check, Package, Truck, Home, XCircle } from 'lucide-react'

const steps = [
  { key: 'pending', label: 'Placed', icon: Check },
  { key: 'processing', label: 'Packed', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
]

export default function OrderTracker({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-blush-from text-sm py-2">
        <XCircle size={18} /> This order was cancelled
      </div>
    )
  }

  const currentIndex = steps.findIndex((s) => s.key === status)

  return (
    <div className="flex items-center justify-between py-4 overflow-x-auto">
      {steps.map((step, i) => {
        const Icon = step.icon
        const done = i <= currentIndex
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-[70px]">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  done ? 'bg-gold text-white' : 'bg-gold/5 text-slate-500 border border-gold/20'
                }`}
              >
                <Icon size={14} />
              </div>
              <span className={`text-[10px] mt-1 text-center whitespace-nowrap ${done ? 'text-gold' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 -mt-4 ${i < currentIndex ? 'bg-gold' : 'bg-white/10'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
