import { useEffect, useRef, useState } from 'react'

function ProductImage({ product, className = '', alt }) {
  const imageRef = useRef(null)
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 })
  const [sourceSize, setSourceSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const image = imageRef.current
    const frame = image?.parentElement
    if (!frame) return undefined

    const measure = () => {
      const bounds = frame.getBoundingClientRect()
      setFrameSize((current) => (
        current.width === bounds.width && current.height === bounds.height
          ? current
          : { width: bounds.width, height: bounds.height }
      ))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [product.imageUrl, product.image])

  function onImageLoad(event) {
    setSourceSize({
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
    })
  }

  const imageScale = Number(product.imageScale ?? 100) / 100
  let style = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'translate3d(-50%, -50%, 0)',
  }

  if (frameSize.width && frameSize.height && sourceSize.width && sourceSize.height) {
    const coverScale = Math.max(frameSize.width / sourceSize.width, frameSize.height / sourceSize.height)
    const renderedWidth = sourceSize.width * coverScale
    const renderedHeight = sourceSize.height * coverScale
    const maxPanX = imageScale > 1 ? Math.max(0, (renderedWidth * imageScale - frameSize.width) / 2) : 0
    const maxPanY = imageScale > 1 ? Math.max(0, (renderedHeight * imageScale - frameSize.height) / 2) : 0
    const panX = maxPanX * ((Number(product.imagePositionX ?? 50) - 50) / 50)
    const panY = maxPanY * ((Number(product.imagePositionY ?? 50) - 50) / 50)

    style = {
      width: `${renderedWidth}px`,
      height: `${renderedHeight}px`,
      transform: `translate3d(calc(-50% + ${panX}px), calc(-50% + ${panY}px), 0) scale(${imageScale})`,
    }
  }

  return (
    <img
      ref={imageRef}
      src={product.image || product.imageUrl}
      alt={alt ?? product.name}
      className={`product-crop-image ${className}`.trim()}
      style={style}
      onLoad={onImageLoad}
    />
  )
}

export default ProductImage
