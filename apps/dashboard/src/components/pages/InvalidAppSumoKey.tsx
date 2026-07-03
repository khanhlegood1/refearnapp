// @/components/pages/InvalidAppSumoKey.tsx
"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldX, ArrowLeft } from "lucide-react"
import Link from "next/link"

type Props = {
  message?: string
}

const InvalidAppSumoKey = ({ message }: Props) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-background/80">
      <div className="w-full max-w-md">
        <Card className="relative shadow-lg border border-destructive/20">
          <CardHeader className="space-y-1">
            <div className="flex flex-col gap-2 justify-center items-center">
              <ShieldX className="w-12 h-12 text-destructive mb-2" />
              <CardTitle className="text-2xl font-bold text-center text-foreground">
                Activation Failed
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">
              {message ||
                "The license key provided could not be verified, has already been claimed, or has expired."}
            </p>

            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default InvalidAppSumoKey
