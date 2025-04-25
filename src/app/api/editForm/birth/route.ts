// /pages/api/editForm/birth/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

// Enhanced helper function to recursively replace null/undefined with appropriate defaults
const replaceNulls = (obj: any, allowNull: boolean = false): any => {
  // Allow null for specific fields (e.g., affidavitOfDelayedRegistration, dateSworn)
  if (obj === null || obj === undefined) return allowNull ? null : {};
  if (typeof obj !== 'object' || obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map((item) => replaceNulls(item, allowNull));

  const newObj: Record<string, any> = {};
  for (const key in obj) {
    // Allow null for specific fields
    const fieldAllowNull = allowNull || key === 'affidavitOfDelayedRegistration' || key === 'dateSworn';
    newObj[key] = replaceNulls(obj[key], fieldAllowNull);
  }
  return newObj;
};

export async function PUT(request: Request) {
  try {
    // Validate Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('JSON parsing error:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Request body is missing or invalid' },
        { status: 400 }
      );
    }

    console.log('Received body:', body);

    const {
      id,
      registryNumber,
      province,
      cityMunicipality,
      pageNumber,
      bookNumber,
      remarks,
      preparedBy,
      preparedByDate,
      receivedBy,
      receivedByPosition,
      receivedByDate,
      registeredBy,
      registeredByPosition,
      registeredByDate,
      childInfo,
      motherInfo,
      fatherInfo,
      parentMarriage,
      attendant,
      informant,
      hasAffidavitOfPaternity,
      affidavitOfPaternityDetails,
      isDelayedRegistration,
      affidavitOfDelayedRegistration,
      reasonForDelay,
    } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Form ID is required' },
        { status: 400 }
      );
    }

    // Sanitize JSON fields
    const safeAffidavitOfPaternityDetails = replaceNulls(affidavitOfPaternityDetails);
    const safeAffidavitOfDelayedRegistration = replaceNulls(affidavitOfDelayedRegistration, true); // Allow null
    const safeChildPlaceOfBirth = replaceNulls(childInfo?.placeOfBirth);
    const safeMotherResidence = replaceNulls(motherInfo?.residence);
    const safeFatherResidence = replaceNulls(fatherInfo?.residence);
    const safeParentMarriage = replaceNulls(parentMarriage);
    const safeAttendant = replaceNulls(attendant);
    const safeInformant = replaceNulls(informant);
    const safePreparer = replaceNulls(preparedBy);

    // Explicitly handle attendant.certification.address
    const safeAttendantCertificationAddress = replaceNulls(attendant?.certification?.address);
    const safeAttendantCertification = attendant?.certification
      ? {
          ...replaceNulls(attendant.certification),
          address: safeAttendantCertificationAddress,
        }
      : {};

    // For string fields that are stored as JSON scalars, pass as string
    const safeReceivedBy = receivedBy || '';
    const safeRegisteredBy = registeredBy || '';

    // Map name objects
    const safeChildName = childInfo
      ? replaceNulls({
          first: childInfo.firstName || '',
          middle: childInfo.middleName || '',
          last: childInfo.lastName || '',
        })
      : { first: '', middle: '', last: '' };

    const safeMotherName = motherInfo
      ? replaceNulls({
          first: motherInfo.firstName || '',
          middle: motherInfo.middleName || '',
          last: motherInfo.lastName || '',
        })
      : { first: '', middle: '', last: '' };

    const safeFatherName = fatherInfo
      ? replaceNulls({
          first: fatherInfo.firstName || '',
          middle: fatherInfo.middleName || '',
          last: fatherInfo.lastName || '',
        })
      : { first: '', middle: '', last: '' };

    // Log sanitized data for debugging
    console.log('Sanitized data:', {
      safeChildName,
      safeChildPlaceOfBirth,
      safeMotherName,
      safeMotherResidence,
      safeFatherName,
      safeFatherResidence,
      safeParentMarriage,
      safeAttendant,
      safeAttendantCertification,
      safeInformant,
      safePreparer,
      safeAffidavitOfPaternityDetails,
      safeAffidavitOfDelayedRegistration,
    });

    const updatedForm = await prisma.baseRegistryForm.update({
      where: { id },
      data: {
        registryNumber,
        province,
        cityMunicipality,
        pageNumber,
        bookNumber,
        remarks,
        preparedByDate: preparedByDate ? new Date(preparedByDate) : null,
        receivedBy: safeReceivedBy,
        receivedByPosition: receivedByPosition || '',
        receivedByDate: receivedByDate ? new Date(receivedByDate) : null,
        registeredBy: safeRegisteredBy,
        registeredByPosition: registeredByPosition || '',
        registeredByDate: registeredByDate ? new Date(registeredByDate) : null,
        updatedAt: new Date(),
        birthCertificateForm: {
          upsert: {
            update: {
              childName: safeChildName,
              sex: childInfo?.sex || '',
              dateOfBirth: childInfo?.dateOfBirth ? new Date(childInfo.dateOfBirth) : new Date(),
              placeOfBirth: safeChildPlaceOfBirth,
              typeOfBirth: childInfo?.typeOfBirth || '',
              multipleBirthOrder: childInfo?.multipleBirthOrder || '',
              birthOrder: childInfo?.birthOrder || '',
              weightAtBirth: childInfo?.weightAtBirth ? String(parseFloat(String(childInfo.weightAtBirth))) : '0',
              motherMaidenName: safeMotherName,
              motherCitizenship: motherInfo?.citizenship || '',
              motherReligion: motherInfo?.religion || '',
              motherOccupation: motherInfo?.occupation || '',
              motherAge: Number(motherInfo?.age ?? 0),
              totalChildrenBornAlive: Number(motherInfo?.totalChildrenBornAlive ?? 0),
              childrenStillLiving: Number(motherInfo?.childrenStillLiving ?? 0),
              childrenNowDead: Number(motherInfo?.childrenNowDead ?? 0),
              motherResidence: safeMotherResidence,
              fatherName: safeFatherName,
              fatherCitizenship: fatherInfo?.citizenship || '',
              fatherReligion: fatherInfo?.religion || '',
              fatherOccupation: fatherInfo?.occupation || '',
              fatherAge: Number(fatherInfo?.age ?? 0),
              fatherResidence: safeFatherResidence,
              parentMarriage: safeParentMarriage,
              attendant: {
                ...safeAttendant,
                certification: safeAttendantCertification,
              },
              informant: safeInformant,
              preparer: safePreparer,
              hasAffidavitOfPaternity: hasAffidavitOfPaternity ?? false,
              affidavitOfPaternityDetails: safeAffidavitOfPaternityDetails,
              affidavitOfDelayedRegistration: safeAffidavitOfDelayedRegistration,
              isDelayedRegistration: isDelayedRegistration ?? false,
              reasonForDelay: reasonForDelay || '',
            },
            create: {
              childName: safeChildName,
              sex: childInfo?.sex || '',
              dateOfBirth: childInfo?.dateOfBirth ? new Date(childInfo.dateOfBirth) : new Date(),
              placeOfBirth: safeChildPlaceOfBirth,
              typeOfBirth: childInfo?.typeOfBirth || '',
              multipleBirthOrder: childInfo?.multipleBirthOrder || '',
              birthOrder: childInfo?.birthOrder || '',
              weightAtBirth: childInfo?.weightAtBirth ? String(parseFloat(String(childInfo.weightAtBirth))) : '0',
              motherMaidenName: safeMotherName,
              motherCitizenship: motherInfo?.citizenship || '',
              motherReligion: motherInfo?.religion || '',
              motherOccupation: motherInfo?.occupation || '',
              motherAge: Number(motherInfo?.age ?? 0),
              totalChildrenBornAlive: Number(motherInfo?.totalChildrenBornAlive ?? 0),
              childrenStillLiving: Number(motherInfo?.childrenStillLiving ?? 0),
              childrenNowDead: Number(motherInfo?.childrenNowDead ?? 0),
              motherResidence: safeMotherResidence,
              fatherName: safeFatherName,
              fatherCitizenship: fatherInfo?.citizenship || '',
              fatherReligion: fatherInfo?.religion || '',
              fatherOccupation: fatherInfo?.occupation || '',
              fatherAge: Number(fatherInfo?.age ?? 0),
              fatherResidence: safeFatherResidence,
              parentMarriage: safeParentMarriage,
              attendant: {
                ...safeAttendant,
                certification: safeAttendantCertification,
              },
              informant: safeInformant,
              preparer: safePreparer,
              hasAffidavitOfPaternity: hasAffidavitOfPaternity ?? false,
              affidavitOfPaternityDetails: safeAffidavitOfPaternityDetails,
              affidavitOfDelayedRegistration: safeAffidavitOfDelayedRegistration,
              isDelayedRegistration: isDelayedRegistration ?? false,
              reasonForDelay: reasonForDelay || '',
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, updatedForm });
  } catch (error: any) {
    console.error('Update error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Form not found' },
          { status: 404 }
        );
      }
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}