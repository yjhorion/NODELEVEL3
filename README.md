# NODELEVEL3

#카테고리 전체조회
yjhorion.co.kr:3000/api/categories

#카테고리 등록
yjhorion.co.kr:3000/api/categories
{
	"name" : "일식"
}

#카테고리 정보 수정
yjhorion.co.kr:3000/api/categories/categoryId
{
	"name" : "id 10를 order 1로 변경합니다",
	"order" : 7
}

#카테고리 정보 삭제
yjhorion.co.kr:3000/api/categories/categoryId

____________________________________________________
#메뉴 조회
yjhorion.co.kr:3000/api/categories/categoryId/menus

#메뉴 등록
yjhorion.co.kr:3000/api/categories/categoryId/menus
{
	"name" : "joitesting",
	"description" : "testingdesc",
	"image" : "https://hanghae00-assets-1.s3.ap-northeast-2.amazonaws.com/sampleIMG.jpg",
	"price" : 200
}

#메뉴 상세 조회
yjhorion.co.kr:3000/api/categories/categoryId/menus/menuId

#메뉴 수정
yjhorion.co.kr:3000/api/categories/categoryId/menus/menuId
{
		"name": "order수정",
		"image": "https://hanghae00-assets-1.s3.ap-northeast-2.amazonaws.com/sampleIMG.jpg",
		"price": 11,
		"order": 3,
		"status": "FOR_SALE"
}

#메뉴 삭제
yjhorion.co.kr:3000/api/categories/categoryId/menus/menuId
