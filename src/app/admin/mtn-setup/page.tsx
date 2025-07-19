"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Copy } from "lucide-react";

export default function MTNSetupPage() {
  const [primaryKey, setPrimaryKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const generateCredentials = async () => {
    if (!primaryKey.trim()) {
      setError("Please enter your MTN MoMo Primary Key");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/mtn/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          primaryKey: primaryKey.trim(),
          callbackHost: window.location.origin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate credentials");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const testCredentials = async () => {
    setTesting(true);
    setError("");

    try {
      const response = await fetch("/api/mtn/setup?test=true");
      const data = await response.json();

      if (data.success) {
        setResult({
          ...result,
          testResult: {
            success: true,
            message: "Credentials are working correctly!",
          },
        });
      } else {
        setError(data.message || "Credentials test failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test failed");
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const envConfig = result?.credentials
    ? `# MTN Mobile Money Configuration
MTN_MOMO_PRIMARY_KEY="${result.credentials.primaryKey}"
MTN_MOMO_API_USER_ID="${result.credentials.apiUserId}"
MTN_MOMO_API_KEY="${result.credentials.apiKey}"
MTN_MOMO_ENVIRONMENT="sandbox"
MTN_MOMO_API_BASE_URL="https://sandbox.momodeveloper.mtn.com"`
    : "";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          MTN Mobile Money Setup
        </h1>
        <p className="text-gray-600">
          Generate and test your MTN MoMo API credentials for sandbox integration.
        </p>
      </div>

      {/* Setup Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate API Credentials</CardTitle>
          <CardDescription>
            Enter your MTN MoMo Primary Key to generate API User ID and API Key.
            You can find your Primary Key in the MTN MoMo Developer Portal under Collections product.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="primaryKey" className="block text-sm font-medium text-gray-700 mb-2">
              MTN MoMo Primary Key
            </label>
            <Input
              id="primaryKey"
              type="password"
              placeholder="Enter your Primary Key from MTN Developer Portal"
              value={primaryKey}
              onChange={(e) => setPrimaryKey(e.target.value)}
              className="w-full"
            />
          </div>

          <Button
            onClick={generateCredentials}
            disabled={loading || !primaryKey.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Credentials...
              </>
            ) : (
              "Generate Credentials"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Result */}
      {result && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <CheckCircle className="mr-2 h-5 w-5" />
              Credentials Generated Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Environment Variables
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(envConfig)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                {envConfig}
              </pre>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                <strong>Next Steps:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Copy the environment variables above to your .env file</li>
                  <li>Restart your development server</li>
                  <li>Test the credentials using the button below</li>
                  <li>Try making a test payment with phone number +237677123456</li>
                </ol>
              </AlertDescription>
            </Alert>

            <Button
              onClick={testCredentials}
              disabled={testing}
              variant="outline"
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Credentials...
                </>
              ) : (
                "Test Credentials"
              )}
            </Button>

            {result.testResult && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {result.testResult.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">1. Get Your Primary Key</h3>
            <p className="text-sm text-gray-600">
              Go to{" "}
              <a
                href="https://momodeveloper.mtn.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                MTN MoMo Developer Portal
              </a>
              , subscribe to the Collections product, and copy your Primary Key.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">2. Generate Credentials</h3>
            <p className="text-sm text-gray-600">
              Enter your Primary Key above and click "Generate Credentials" to create your API User ID and API Key.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">3. Test Phone Numbers</h3>
            <p className="text-sm text-gray-600">
              Use these test numbers in sandbox:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
              <li>+237677123456 (will always succeed)</li>
              <li>+237681234567 (will always succeed)</li>
              <li>+237677999999 (will always fail - for testing)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">4. Payment Flow</h3>
            <p className="text-sm text-gray-600">
              When users pay with MTN MoMo, they'll receive a USSD prompt on their phone to enter their PIN and confirm the payment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
