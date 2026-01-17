"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "./Skeleton";

// Loading component for modals
const ModalLoading = () => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="card max-w-lg w-full p-8 rounded-2xl">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-6" />
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);

// Lazy load infrequently used modals
export const LazyTeamWorkspaces = dynamic(
  () => import("./TeamWorkspaces"),
  { loading: () => <ModalLoading /> }
);

export const LazyAPIAccess = dynamic(
  () => import("./APIAccess"),
  { loading: () => <ModalLoading /> }
);

export const LazyWebhookIntegration = dynamic(
  () => import("./WebhookIntegration"),
  { loading: () => <ModalLoading /> }
);

export const LazyDocumentScheduling = dynamic(
  () => import("./DocumentScheduling"),
  { loading: () => <ModalLoading /> }
);

export const LazyApprovalWorkflow = dynamic(
  () => import("./ApprovalWorkflow"),
  { loading: () => <ModalLoading /> }
);

export const LazyBatchSend = dynamic(
  () => import("./BatchSend"),
  { loading: () => <ModalLoading /> }
);

export const LazyDocumentComparison = dynamic(
  () => import("./DocumentComparison"),
  { loading: () => <ModalLoading /> }
);

export const LazyAuditTrail = dynamic(
  () => import("./AuditTrail"),
  { loading: () => <ModalLoading /> }
);

export const LazyBulkGeneration = dynamic(
  () => import("./BulkGeneration"),
  { loading: () => <ModalLoading /> }
);

export const LazyPDFImport = dynamic(
  () => import("./PDFImport"),
  { loading: () => <ModalLoading /> }
);

export const LazyTemplateVariables = dynamic(
  () => import("./TemplateVariables"),
  { loading: () => <ModalLoading /> }
);

export const LazySignaturePlacement = dynamic(
  () => import("./SignaturePlacement"),
  { loading: () => <ModalLoading /> }
);

export const LazyDocumentRevisions = dynamic(
  () => import("./DocumentRevisions"),
  { loading: () => <ModalLoading /> }
);

export const LazyExportHistory = dynamic(
  () => import("./ExportHistory"),
  { loading: () => <ModalLoading /> }
);

export const LazyDocumentExpiration = dynamic(
  () => import("./DocumentExpiration"),
  { loading: () => <ModalLoading /> }
);

