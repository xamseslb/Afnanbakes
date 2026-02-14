import { motion } from 'framer-motion';
import { Upload, X, User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { OrderData, ProductType } from '@/lib/orderTypes';
import { useRef } from 'react';

interface DetailsSectionProps {
  orderData: OrderData;
  onUpdate: (data: Partial<OrderData>) => void;
  onContinue: () => void;
}

export function DetailsSection({ orderData, onUpdate, onContinue }: DetailsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show cake fields if a package was selected (most packages include cakes) or if productType is kaker/cupcakes
  const hasPackage = !!orderData.selectedPackage;
  const isCustom = orderData.isCustomDesign;
  const packageIncludesCake = orderData.selectedPackage?.items.some(
    (item) => item.toLowerCase().includes('kake') || item.toLowerCase().includes('cupcake')
  ) ?? false;
  const showCakeFields = packageIncludesCake || orderData.productType === 'kaker' || orderData.productType === 'cupcakes';

  // Only show quantity field for custom designs (packages have predefined quantities)
  const showQuantity = !hasPackage;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onUpdate({ images: [...orderData.images, ...files] });
  };

  const removeImage = (index: number) => {
    const newImages = orderData.images.filter((_, i) => i !== index);
    onUpdate({ images: newImages });
  };

  // Quantity is only required for custom designs
  const isValid = orderData.customerName.trim() !== '' && orderData.customerEmail.trim() !== '' && orderData.customerPhone.trim() !== '' && (hasPackage || orderData.quantity.trim() !== '');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
          Fortell oss mer
        </h2>
        <p className="text-muted-foreground text-lg">
          Jo mer detaljer, jo bedre resultat
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6 bg-card rounded-2xl p-6 md:p-8 shadow-soft"
      >
        {/* Customer Contact Info */}
        <div className="space-y-4 pb-6 border-b border-border">
          <h3 className="font-serif text-lg font-semibold text-foreground">Kontaktinformasjon</h3>

          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-base flex items-center gap-2">
              <User className="w-4 h-4" /> Fullt navn *
            </Label>
            <Input
              id="customerName"
              placeholder="Ditt fulle navn"
              value={orderData.customerName}
              onChange={(e) => onUpdate({ customerName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail" className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4" /> E-post *
            </Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="din@epost.no"
              value={orderData.customerEmail}
              onChange={(e) => onUpdate({ customerEmail: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone" className="text-base flex items-center gap-2">
              <Phone className="w-4 h-4" /> Telefon *
            </Label>
            <Input
              id="customerPhone"
              type="tel"
              placeholder="+47 XXX XX XXX"
              value={orderData.customerPhone}
              onChange={(e) => onUpdate({ customerPhone: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base">
            Beskrivelse / Forslag
          </Label>
          <Textarea
            id="description"
            placeholder="Fortell oss om din visjon..."
            value={orderData.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="min-h-[100px] resize-none"
          />
        </div>

        {/* Ideas */}
        <div className="space-y-2">
          <Label htmlFor="ideas" className="text-base">
            Ideer
          </Label>
          <Textarea
            id="ideas"
            placeholder="Farger, tema, stil..."
            value={orderData.ideas}
            onChange={(e) => onUpdate({ ideas: e.target.value })}
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Cake-specific fields */}
        {showCakeFields && (
          <>
            <div className="space-y-2">
              <Label htmlFor="cakeName" className="text-base">
                Navn på kaken
              </Label>
              <Input
                id="cakeName"
                placeholder="F.eks. 'Emma 30 år'"
                value={orderData.cakeName}
                onChange={(e) => onUpdate({ cakeName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cakeText" className="text-base">
                Tekst på kaken
              </Label>
              <Input
                id="cakeText"
                placeholder="Hva skal stå på kaken?"
                value={orderData.cakeText}
                onChange={(e) => onUpdate({ cakeText: e.target.value })}
              />
            </div>
          </>
        )}

        {/* Quantity — only for custom designs */}
        {showQuantity && (
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-base">
              Antall personer / stykker *
            </Label>
            <Input
              id="quantity"
              placeholder="F.eks. '20 personer' eller '24 stykker'"
              value={orderData.quantity}
              onChange={(e) => onUpdate({ quantity: e.target.value })}
              required
            />
          </div>
        )}

        {/* Image Upload */}
        <div className="space-y-3">
          <Label className="text-base">Inspirasjonsbilder (valgfritt)</Label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 border-dashed gap-2"
          >
            <Upload className="w-5 h-5" />
            Last opp bilder
          </Button>

          {orderData.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {orderData.images.map((file, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden w-20 h-20"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Continue Button */}
        <Button
          onClick={onContinue}
          disabled={!isValid}
          className="w-full rounded-full mt-6"
          size="lg"
        >
          Fortsett
        </Button>
      </motion.div>
    </div>
  );
}
