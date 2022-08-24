import {
  collection as firestoreCollection,
  CollectionReference,
  doc as firestoreDoc,
  DocumentReference,
  getFirestore,
} from "firebase/firestore";
import { firebaseApp } from "../firebase";

export function collection<T>(
  document: DocumentReference | undefined,
  path: string,
  ...pathSegments: string[]
): CollectionReference<T> {
  if (document) {
    return firestoreCollection(
      document,
      path,
      ...pathSegments
    ) as CollectionReference<T>;
  } else {
    // collection is root level
    return firestoreCollection(
      getFirestore(firebaseApp),
      path,
      ...pathSegments
    ) as CollectionReference<T>;
  }
  // TODO: there is no collection<T>() in firestore API? why?
}

export function doc<T>(
  collection: CollectionReference<T>,
  path: string,
  ...pathSegments: string[]
): DocumentReference<T> {
  return firestoreDoc<T>(collection, path, ...pathSegments);
}
