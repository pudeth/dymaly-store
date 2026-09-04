# Testing Guide - Image Upload & Dropdowns

## 🧪 Quick Test Checklist

### ✅ Image Upload Testing

#### Test 1: Click to Upload
- [ ] Open admin panel (http://localhost:3000/admin.html)
- [ ] Login (admin / admin123)
- [ ] Click "Products" tab
- [ ] Click "+ Add Product" button
- [ ] Click on image upload area
- [ ] Select an image file
- [ ] ✓ Image preview appears immediately
- [ ] Fill product details
- [ ] Click "Save Product"
- [ ] ✓ Button shows processing state
- [ ] ✓ Product saves with image
- [ ] ✓ Success message appears

#### Test 2: Drag & Drop
- [ ] Click "+ Add Product"
- [ ] Drag an image file from your computer
- [ ] Drop it on the upload area
- [ ] ✓ Drag-over effect shows
- [ ] ✓ Image preview appears
- [ ] ✓ File is ready to upload

#### Test 3: Choose File Button
- [ ] Click "+ Add Product"
- [ ] Click "📁 Choose File" button
- [ ] Select image from picker
- [ ] ✓ Preview displays
- [ ] ✓ Remove button appears

#### Test 4: Remove Image
- [ ] Upload an image
- [ ] Click "🗑️ Remove" button
- [ ] ✓ Preview clears
- [ ] ✓ Upload area resets
- [ ] ✓ Remove button hides

#### Test 5: Replace Image
- [ ] Edit existing product
- [ ] ✓ Current image loads in preview
- [ ] Upload different image
- [ ] ✓ New preview replaces old
- [ ] Save product
- [ ] ✓ New image saves

#### Test 6: File Validation
- [ ] Try uploading PDF file
- [ ] ✓ Error: "Only image files allowed"
- [ ] Try uploading 10MB image
- [ ] ✓ Error: "File size must be less than 5MB"
- [ ] Upload 2MB JPG
- [ ] ✓ Success

---

### ✅ Dropdown Testing

#### Test 1: Brand Dropdown
- [ ] Click "+ Add Product"
- [ ] Click Brand dropdown
- [ ] ✓ Shows custom arrow
- [ ] ✓ Orange border on hover
- [ ] ✓ Glow effect on focus
- [ ] ✓ All brands listed
- [ ] Select a brand
- [ ] ✓ Selected value shows

#### Test 2: Category Dropdown
- [ ] Open product form
- [ ] Click Category dropdown
- [ ] ✓ Icons show with names (📱 Smartphones)
- [ ] ✓ Hover highlights option
- [ ] ✓ Custom styling applied
- [ ] Select category
- [ ] ✓ Selection works

#### Test 3: Keyboard Navigation
- [ ] Tab to Brand dropdown
- [ ] ✓ Focus ring appears
- [ ] Press Space/Enter to open
- [ ] Use arrow keys to navigate
- [ ] ✓ Options highlight
- [ ] Press Enter to select
- [ ] ✓ Selection works

---

### ✅ Integration Testing

#### Test 1: Complete Product Flow
- [ ] Add new product with all fields
- [ ] Upload image via drag & drop
- [ ] Select brand from dropdown
- [ ] Select category from dropdown
- [ ] Enter price and stock
- [ ] Add description
- [ ] Save product
- [ ] ✓ All data saves correctly
- [ ] View product on customer site
- [ ] ✓ Image displays properly

#### Test 2: Edit Product Flow
- [ ] Edit existing product
- [ ] ✓ All fields pre-filled
- [ ] ✓ Image loads in preview
- [ ] ✓ Dropdowns show current values
- [ ] Change image
- [ ] Change brand
- [ ] Save changes
- [ ] ✓ Updates apply correctly

#### Test 3: Brand Management Integration
- [ ] Create new brand
- [ ] Open product form
- [ ] ✓ New brand appears in dropdown
- [ ] Delete unused brand
- [ ] Open product form
- [ ] ✓ Brand removed from dropdown

---

### ✅ Mobile Testing

#### Test on Mobile Device
- [ ] Open admin on mobile browser
- [ ] Navigate to Products tab
- [ ] Add new product
- [ ] ✓ Upload area responsive
- [ ] ✓ Touch targets adequate size
- [ ] ✓ Dropdowns work on touch
- [ ] ✓ Buttons stack vertically
- [ ] Upload image from mobile
- [ ] ✓ Camera option available
- [ ] ✓ Gallery picker works

---

### ✅ Error Handling Testing

#### Test 1: Network Failure
- [ ] Start upload
- [ ] Stop server mid-upload
- [ ] ✓ Error message appears
- [ ] ✓ Button returns to normal state
- [ ] ✓ Can retry

#### Test 2: Invalid File Types
- [ ] Try .pdf → ✓ Rejected
- [ ] Try .txt → ✓ Rejected
- [ ] Try .doc → ✓ Rejected
- [ ] Try .exe → ✓ Rejected
- [ ] Try .jpg → ✓ Accepted

#### Test 3: Large Files
- [ ] Upload 1MB file → ✓ Works
- [ ] Upload 3MB file → ✓ Works
- [ ] Upload 6MB file → ✓ Rejected
- [ ] Upload 10MB file → ✓ Rejected

---

### ✅ Visual Testing

#### Check All States

**Dropdown States:**
- [ ] ✓ Normal: Light border
- [ ] ✓ Hover: Orange border
- [ ] ✓ Focus: Orange glow
- [ ] ✓ Open: Options visible

**Upload Area States:**
- [ ] ✓ Empty: Dashed border, placeholder
- [ ] ✓ Hover: Orange highlight
- [ ] ✓ Drag over: Transform scale
- [ ] ✓ With image: Solid border, preview
- [ ] ✓ Uploading: Spinner animation

**Button States:**
- [ ] ✓ Normal: Gradient background
- [ ] ✓ Hover: Darker, lifted
- [ ] ✓ Processing: Spinner
- [ ] ✓ Success: Green, checkmark
- [ ] ✓ Disabled: Grayed out

---

### ✅ Performance Testing

#### Image Upload Speed
- [ ] Upload 500KB image
  - ✓ Should complete in <2 seconds
- [ ] Upload 2MB image
  - ✓ Should complete in <5 seconds
- [ ] Upload 5MB image
  - ✓ Should complete in <10 seconds

#### UI Responsiveness
- [ ] Dropdown hover → ✓ Instant
- [ ] Image preview → ✓ <1 second
- [ ] Form submission → ✓ <3 seconds
- [ ] Modal open/close → ✓ Smooth

---

### ✅ Accessibility Testing

#### Keyboard Navigation
- [ ] Tab through all form fields
- [ ] ✓ Focus indicators visible
- [ ] ✓ Logical tab order
- [ ] ✓ Can submit with Enter

#### Screen Reader
- [ ] Labels read correctly
- [ ] Buttons have descriptive text
- [ ] Error messages announced
- [ ] Status updates announced

---

## 🐛 Common Issues & Solutions

### Issue: Image Not Uploading
**Symptoms:** Stuck on processing
**Check:**
- Server is running
- Network connection
- File size < 5MB
- File type is image
**Solution:** Refresh page, try smaller file

### Issue: Dropdown Not Showing Options
**Symptoms:** Dropdown empty
**Check:**
- Brands/categories created
- Logged in as admin
- API endpoints working
**Solution:** Add brands/categories first

### Issue: Preview Not Showing
**Symptoms:** Upload works but no preview
**Check:**
- Browser console for errors
- File is valid image
- JavaScript loaded
**Solution:** Hard refresh (Ctrl+F5)

---

## 📊 Expected Results

### After Successful Upload
```
✓ Image file stored in /public/uploads/
✓ Filename: product-[timestamp]-[random].jpg
✓ Database has image URL
✓ Product displays with image
✓ Customer site shows image
```

### Dropdown Behavior
```
✓ Brand dropdown populated from database
✓ Category dropdown shows icons + names
✓ Custom styling applied
✓ Smooth interactions
✓ Selection updates form
```

---

## 🎯 Testing Summary

Run through all tests above and check each box. If all ✓ marks are checked, the feature is working correctly!

### Quick Smoke Test (2 minutes)
1. ✅ Login to admin
2. ✅ Add product with image upload
3. ✅ Select brand and category from dropdowns
4. ✅ Save and verify on customer site
5. ✅ Edit product and change image
6. ✅ Verify changes saved

If all 6 pass → ✨ Feature is ready!

---

*Happy Testing! 🧪*
