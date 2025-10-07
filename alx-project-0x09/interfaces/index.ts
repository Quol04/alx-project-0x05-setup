import * as React from "react"

export interface ReactComponentProps {
    children: React.ReactNode
}

export interface GeneratedImageProps{
    imageUrl: string
    prompt: string
    width?: string
    height?: string
    action: (imagePath: string) => void

}

export interface RequestProps{
    prompt: string
}

export type ImageProps = Pick<GeneratedImageProps, "imageUrl" | "prompt">
