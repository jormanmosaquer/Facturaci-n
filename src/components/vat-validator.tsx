"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, ShieldX, TestTube2 } from "lucide-react";
import { validateVatAction } from "@/app/actions";
import { type ValidateVatOutput } from "@/ai/flows/vat-validator";

interface VatValidatorProps {
  vatNumber: string;
}

export function VatValidator({ vatNumber }: VatValidatorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidateVatOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidation = useCallback(async () => {
    if (!vatNumber) {
      setError("Por favor, introduzca un número de IVA.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    const response = await validateVatAction({ vatNumber });

    if (response.success) {
      setResult(response.data);
    } else {
      setError(response.error);
    }

    setIsLoading(false);
  }, [vatNumber]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
         <Label htmlFor="vat-validator" className="sr-only">Validar IVA</Label>
        <Button
          type="button"
          id="vat-validator"
          variant="outline"
          onClick={handleValidation}
          disabled={isLoading || !vatNumber}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <TestTube2 className="mr-2 h-4 w-4" />
          )}
          Validar IVA con IA
        </Button>
      </div>

      {result && (
        <Alert variant={result.isValid ? "default" : "destructive"}>
          {result.isValid ? <ShieldCheck className="h-4 w-4" /> : <ShieldX className="h-4 w-4" />}
          <AlertTitle className="flex items-center gap-2">
            Resultado de Validación
            <Badge variant={result.isValid ? "secondary" : "destructive"}>
              {result.isValid ? "Válido" : "Inválido"}
            </Badge>
          </AlertTitle>
          <AlertDescription>{result.validationDetails}</AlertDescription>
        </Alert>
      )}
      {error && (
         <Alert variant="destructive">
            <ShieldX className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
