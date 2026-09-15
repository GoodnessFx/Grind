import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"
import { ChevronDown } from "lucide-react"

interface FeatureItem {
  id: number
  title: string
  image: string
  description: string
  badge?: string
}

interface AccordionFeatureProps {
  features: FeatureItem[]
  heading?: string
  subheading?: string
}

export function AccordionFeature({ features, heading, subheading }: AccordionFeatureProps) {
  const [activeId, setActiveId] = useState<number>(features[0]?.id ?? 1)
  const activeFeature = features.find(f => f.id === activeId)

  return (
    <section className="py-24 bg-[#f8fafc]">
      <div className="max-w-[1200px] mx-auto px-6">
        {(heading || subheading) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl font-black text-[var(--grind-primary)] tracking-tight mb-4">{heading}</h2>
            )}
            {subheading && (
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">{subheading}</p>
            )}
          </div>
        )}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-12 items-start">
          {/* Accordion side */}
          <div className="w-full space-y-0">
            {features.map((f) => {
              const isOpen = activeId === f.id
              return (
                <div key={f.id} className={cn("border-b border-gray-200 last:border-b-0")}>
                  <button
                    onClick={() => setActiveId(f.id)}
                    className="w-full flex items-center justify-between py-6 text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 transition-all",
                        isOpen ? "bg-[var(--grind-nigeria)] text-white" : "bg-gray-100 text-gray-400"
                      )}>{f.id}</span>
                      <span className={cn(
                        "text-xl font-bold transition-colors",
                        isOpen ? "text-[var(--grind-primary)]" : "text-gray-400 group-hover:text-gray-700"
                      )}>{f.title}</span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={cn(
                        "shrink-0 transition-transform duration-300 text-gray-400",
                        isOpen && "rotate-180 text-[var(--grind-nigeria)]"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-600 leading-relaxed pb-6 pl-12 font-medium">{f.description}</p>
                        {/* Mobile image */}
                        <div className="md:hidden mb-6 pl-12">
                          <img src={f.image} alt={f.title} className="w-full rounded-xl object-cover aspect-[4/3] shadow-md" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          {/* Image side — desktop only */}
          <div className="hidden md:block sticky top-24">
            <AnimatePresence mode="wait">
              {activeFeature && (
                <motion.div
                  key={activeFeature.id}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]"
                >
                  <img
                    src={activeFeature.image}
                    alt={activeFeature.title}
                    className="w-full h-full object-cover"
                  />
                  {activeFeature.badge && (
                    <div className="absolute top-4 right-4 bg-[var(--grind-nigeria)] text-white text-xs font-bold px-3 py-1 rounded-full">
                      {activeFeature.badge}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
