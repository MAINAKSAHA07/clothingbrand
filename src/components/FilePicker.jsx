import React from 'react'

import CustomButton from './CustomButton'

const FilePicker = ({ file, setFile, readFile }) => {
  return (
    <div className="filepicker-container">
      <div className="flex-1 flex flex-col">
        <input 
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <label htmlFor="file-upload" className="filepicker-label">
          Upload File
        </label>

        <p className="mt-2 text-gray-500 text-xs truncate">
          {file === '' ? "No file selected" : file.name}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <CustomButton 
          type="outline"
          title="Front Logo"
          handleClick={() => readFile('frontLogo')}
          customStyles="text-[10px] px-2 py-1.5"
        />
        <CustomButton 
          type="outline"
          title="Back Logo"
          handleClick={() => readFile('backLogo')}
          customStyles="text-[10px] px-2 py-1.5"
        />
        <CustomButton 
          type="filled"
          title="Full Texture"
          handleClick={() => readFile('full')}
          customStyles="text-[10px] px-2 py-1.5"
        />
      </div>
    </div>
  )
}

export default FilePicker