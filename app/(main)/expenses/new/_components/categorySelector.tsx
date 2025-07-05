'use client'
import React, { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const CategorySelector = ({categories, onChange}: {categories: {id: string; name: string; icon: any; isDefault?: boolean}[]; onChange: (category: string) => void}) => {
  
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    

    if(onChange&& categoryId !== selectedCategory) {
      onChange(categoryId);
    }
  }

  if(!categories || categories.length === 0) {
    return <div className="text-sm text-gray-600">No categories found</div>
  }

  useEffect(() => {
    if(!selectedCategory && categories.length > 0) {
      const defaultCategory = categories.find((category)=> category.isDefault)|| categories[0];
  
      setTimeout(() => {
        setSelectedCategory(defaultCategory.id);
        if(onChange) {
          onChange(defaultCategory.id);
        }
      }, 100);
    }
  }, []);

  

  return (
    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select a category" />
  </SelectTrigger>
  <SelectContent>
    {categories.map((category)=> (
      <SelectItem key={category.id} value={category.id}>
        <div>
         
          <span>{category.name}</span>
        </div>
        </SelectItem>
    ))}
  </SelectContent>
</Select>
  )
}

export default CategorySelector
