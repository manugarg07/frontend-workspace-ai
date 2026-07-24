import React, { useMemo, useCallback } from 'react'
import { ToolLayout } from '@/components/common/ToolLayout'
import { EncryptPanel } from '../components/EncryptPanel'
import { DecryptPanel } from '../components/DecryptPanel'
import { OutputPanel } from '../components/OutputPanel'
import { SecurityNotice } from '../components/SecurityNotice'
import { CodeExamples } from '../components/CodeExamples'
import { FAQ } from '../components/FAQ'
import { RelatedTools } from '../components/RelatedTools'
import { useAES } from '../hooks/useAES'
import { CheckCircle2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// Memoized sub-components to optimize render cycles
const MemoizedEncryptPanel = React.memo(EncryptPanel)
const MemoizedDecryptPanel = React.memo(DecryptPanel)
const MemoizedOutputPanel = React.memo(OutputPanel)
const MemoizedCodeExamples = React.memo(CodeExamples)
const MemoizedSecurityNotice = React.memo(SecurityNotice)
const MemoizedFAQ = React.memo(FAQ)
const MemoizedRelatedTools = React.memo(RelatedTools)

export function AESEncryptionTool() {
  const aes = useAES()

  // Dynamic success banner renderer
  const successBanner = useMemo(() => {
    if (!aes.successMessage) return null
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4 animate-fade-in shadow-sm">
        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
        <span>{aes.successMessage}</span>
      </div>
    )
  }, [aes.successMessage])

  // Callbacks passed to panels
  const handleTabEncrypt = useCallback(() => aes.handleTabChange('encrypt'), [aes.handleTabChange])
  const handleTabDecrypt = useCallback(() => aes.handleTabChange('decrypt'), [aes.handleTabChange])

  const workspaceSection = (
    <div className="flex flex-col gap-8 w-full font-sans">
      {/* Tab bar header with Reset Button */}
      <div className="flex justify-between items-center border-b border-border/40 pb-4 flex-wrap gap-4">
        <div className="border border-border/60 bg-secondary/20 p-1 rounded-xl flex gap-1 text-sm font-semibold max-w-[240px] w-full sm:w-auto">
          <button
            onClick={handleTabEncrypt}
            className={`flex-1 py-1.5 px-3 rounded-lg text-center transition-all cursor-pointer ${
              aes.activeTab === 'encrypt'
                ? 'bg-card text-foreground shadow-sm font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Encrypt
          </button>
          <button
            onClick={handleTabDecrypt}
            className={`flex-1 py-1.5 px-3 rounded-lg text-center transition-all cursor-pointer ${
              aes.activeTab === 'decrypt'
                ? 'bg-card text-foreground shadow-sm font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Decrypt
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={aes.handleReset}
          className="text-xs font-semibold gap-1.5 border border-border/60 bg-card hover:bg-secondary/40 shadow-sm"
          aria-label="Reset all inputs and outputs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Everything</span>
        </Button>
      </div>

      {successBanner}

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full">
        {/* Left Input & Settings Panel */}
        <div className="flex flex-col gap-6 w-full">
          {aes.activeTab === 'encrypt' ? (
            <MemoizedEncryptPanel
              plaintext={aes.plaintext}
              setPlaintext={aes.setPlaintext}
              inputType={aes.inputType}
              setInputType={aes.setInputType}
              keySize={aes.keySize}
              setKeySize={aes.setKeySize}
              keyMode={aes.keyMode}
              setKeyMode={aes.setKeyMode}
              secretKey={aes.secretKey}
              setSecretKey={aes.setSecretKey}
              iv={aes.iv}
              setIv={aes.setIv}
              encoding={aes.encoding}
              setEncoding={aes.setEncoding}
              onEncrypt={aes.handleEncrypt}
              validationError={aes.error}
              keyValidationError={aes.keyValidationError}
              ivValidationError={aes.ivValidationError}
              plaintextJsonValidationError={aes.plaintextJsonValidationError}
              isEncryptDisabled={aes.isEncryptDisabled}
            />
          ) : (
            <MemoizedDecryptPanel
              ciphertext={aes.ciphertext}
              setCiphertext={aes.setCiphertext}
              secretKey={aes.secretKey}
              setSecretKey={aes.setSecretKey}
              keySize={aes.keySize}
              setKeySize={aes.setKeySize}
              keyMode={aes.keyMode}
              setKeyMode={aes.setKeyMode}
              iv={aes.iv}
              setIv={aes.setIv}
              authTag={aes.separateAuthTag}
              setAuthTag={aes.setSeparateAuthTag}
              encoding={aes.encoding}
              setEncoding={aes.setEncoding}
              onDecrypt={aes.handleDecrypt}
              validationError={aes.error}
              keyValidationError={aes.keyValidationError}
              ivValidationError={aes.ivValidationError}
              ciphertextValidationError={aes.ciphertextValidationError}
              tagValidationError={aes.tagValidationError}
              isDecryptDisabled={aes.isDecryptDisabled}
              onImportJSON={aes.handleImportJSON}
            />
          )}
        </div>

        {/* Right Output Panel */}
        <div className="w-full h-full lg:sticky lg:top-24">
          {aes.activeTab === 'encrypt' ? (
            <MemoizedOutputPanel
              output={aes.encryptOutput}
              mode="encrypt"
              iv={aes.iv}
              keyStr={aes.secretKey}
              authTag={aes.authTag}
              encoding={aes.encoding}
              stats={aes.encryptStats}
              error={aes.error}
              onAutoTransfer={aes.handleAutoTransfer}
            />
          ) : (
            <MemoizedOutputPanel
              output={aes.decryptOutput}
              mode="decrypt"
              iv={aes.iv}
              keyStr={aes.secretKey}
              encoding={aes.encoding}
              stats={aes.decryptStats}
              error={aes.error}
            />
          )}
        </div>
      </div>

      {/* Security notice block */}
      <MemoizedSecurityNotice />

      {/* Production code generation templates */}
      <MemoizedCodeExamples keySize={aes.keySize} encoding={aes.encoding} />
      
      {/* FAQ block */}
      <MemoizedFAQ />

      {/* Related tools suggestions block */}
      <MemoizedRelatedTools />
    </div>
  )

  return (
    <ToolLayout
      toolSlug="aes-encryption-decryption"
      editorSection={workspaceSection}
    />
  )
}

export default AESEncryptionTool
