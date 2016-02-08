import React from 'react'
import numeral from 'numeral'

export default (props) => {
  const formattedFileSize = numeral(props.fileSize).format('0.[0] b')
  const nameAndSize = props.fileName + ' (' + formattedFileSize + ')'

  const removeAttachment = () => props.removeAttachment(props.id)

  return (
    <div className="attachment">
      <a href={props.url} title={nameAndSize} target="_blank">
        {props.thumbnailUrl ? (
          <img src={props.thumbnailUrl} alt={nameAndSize} />
        ) : (
          props.id
        )}
      </a>

      {props.isEditing ? (
        <a className="remove-attachment fa fa-times" title="Remove image" onClick={removeAttachment}></a>
      ) : false}
    </div>
  )
}
