import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const useToast = () => {
  const toast = {
    success: (message: string, props?: ToastProps) => {
      return sonnerToast.success(props?.title || message, {
        description: props?.description,
        action: props?.action ? {
          label: props.action.label,
          onClick: props.action.onClick,
        } : undefined,
      })
    },
    error: (message: string, props?: ToastProps) => {
      return sonnerToast.error(props?.title || message, {
        description: props?.description,
        action: props?.action ? {
          label: props.action.label,
          onClick: props.action.onClick,
        } : undefined,
      })
    },
    info: (message: string, props?: ToastProps) => {
      return sonnerToast.info(props?.title || message, {
        description: props?.description,
        action: props?.action ? {
          label: props.action.label,
          onClick: props.action.onClick,
        } : undefined,
      })
    },
    warning: (message: string, props?: ToastProps) => {
      return sonnerToast.warning(props?.title || message, {
        description: props?.description,
        action: props?.action ? {
          label: props.action.label,
          onClick: props.action.onClick,
        } : undefined,
      })
    },
    loading: (message: string, props?: ToastProps) => {
      return sonnerToast.loading(props?.title || message, {
        description: props?.description,
      })
    },
    dismiss: (toastId?: string | number) => {
      sonnerToast.dismiss(toastId)
    },
    promise: <T>(
      promise: Promise<T>,
      {
        loading,
        success,
        error,
      }: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: any) => string)
      }
    ) => {
      return sonnerToast.promise(promise, {
        loading,
        success,
        error,
      })
    },
  }

  return { toast }
}

export { useToast }