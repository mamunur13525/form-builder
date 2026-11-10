export interface ConfigFieldsProps {
    config: any
    formTitle: string
    onFieldChange: (key: string, value: any) => void
}

export interface CopyScriptProps {
    copiedScript: boolean
    onCopyScript: () => void
}
