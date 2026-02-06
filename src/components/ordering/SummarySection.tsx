import { motion } from 'framer-motion';
import { Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderData, occasionLabels, productLabels } from '@/lib/orderTypes';

interface SummarySectionProps {
  orderData: OrderData;
  onEdit: () => void;
  onConfirm: () => void;
}

export function SummarySection({ orderData, onEdit, onConfirm }: SummarySectionProps) {
  const summaryItems = [
    {
      label: 'Anledning',
      value: orderData.occasion ? occasionLabels[orderData.occasion] : '-',
    },
    {
      label: 'Produkt',
      value: orderData.productType ? productLabels[orderData.productType] : '-',
    },
    {
      label: 'Beskrivelse',
      value: orderData.description || 'Ingen beskrivelse',
    },
    {
      label: 'Ideer',
      value: orderData.ideas || 'Ingen spesifikke ideer',
    },
    ...(orderData.cakeName ? [{
      label: 'Navn på kaken',
      value: orderData.cakeName,
    }] : []),
    ...(orderData.cakeText ? [{
      label: 'Tekst på kaken',
      value: orderData.cakeText,
    }] : []),
    {
      label: 'Antall',
      value: orderData.quantity,
    },
    {
      label: 'Bilder',
      value: `${orderData.images.length} bilde${orderData.images.length !== 1 ? 'r' : ''} lastet opp`,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
          Oppsummering
        </h2>
        <p className="text-muted-foreground text-lg">
          Se over bestillingen din
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-6 md:p-8 shadow-soft"
      >
        <div className="space-y-4">
          {summaryItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-border last:border-0"
            >
              <span className="text-muted-foreground font-medium w-40 shrink-0 mb-1 sm:mb-0">
                {item.label}
              </span>
              <span className="text-foreground">
                {item.value}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Image previews */}
        {orderData.images.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-muted-foreground font-medium mb-3">Opplastede bilder</p>
            <div className="flex flex-wrap gap-2">
              {orderData.images.map((file, index) => (
                <div
                  key={index}
                  className="rounded-lg overflow-hidden w-16 h-16"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button
            variant="outline"
            onClick={onEdit}
            className="flex-1 rounded-full gap-2"
            size="lg"
          >
            <Edit2 className="w-4 h-4" />
            Endre
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 rounded-full gap-2"
            size="lg"
          >
            <Check className="w-4 h-4" />
            Bekreft bestilling
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
