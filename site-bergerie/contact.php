<?php
/* =========================================================
   La Bergerie de la Sille — traitement du formulaire
   Envoi vers info@labergeriedelasille.be
   ========================================================= */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Location: index.html'); exit; }

/* Langue (fr par défaut) : détermine les pages de redirection */
$lang    = (isset($_POST['lang']) && $_POST['lang'] === 'nl') ? 'nl' : 'fr';
$pageOk  = ($lang === 'nl') ? 'nl/bedankt.html'  : 'merci.html';
$pageKo  = ($lang === 'nl') ? 'nl/contact.html'  : 'contact.html';

/* Anti-spam : champ piège invisible. Rempli => robot, on fait semblant d'accepter. */
if (!empty($_POST['site_web'])) { header('Location: ' . $pageOk); exit; }

function clean($s) { return trim(str_replace(["\r", "\n"], ' ', (string)($s ?? ''))); }

$nom     = clean($_POST['nom'] ?? '');
$tel     = clean($_POST['tel'] ?? '');
$email   = clean($_POST['email'] ?? '');
$sujet   = clean($_POST['sujet'] ?? '');
$message = trim((string)($_POST['message'] ?? ''));
$consent = !empty($_POST['consentement']);

/* Validation minimale côté serveur */
if ($nom === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $message === '' || !$consent) {
    header('Location: ' . $pageKo . '?erreur=1');
    exit;
}

/* Libellés lisibles pour le sujet */
$libelles = [
    'beliers'  => 'Achat d\'un bélier reproducteur',
    'agnelles' => 'Achat d\'agnelles / antenaises',
    'brebis'   => 'Achat de brebis adultes',
    'troupeau' => 'Constitution d\'un troupeau complet',
    'conseil'  => 'Conseil génétique / consanguinité',
    'visite'   => 'Visite de l\'élevage',
    'autre'    => 'Autre question',
];
$sujetLisible = $libelles[$sujet] ?? ($sujet !== '' ? $sujet : 'Non précisé');

$to      = 'info@labergeriedelasille.be';
$subject = 'Site — ' . $sujetLisible . ' — ' . $nom;

$body = "Nouvelle demande depuis labergeriedelasille.be\n"
      . "Langue du formulaire : " . strtoupper($lang) . "\n"
      . str_repeat('-', 52) . "\n\n"
      . "Nom        : $nom\n"
      . "E-mail     : $email\n"
      . "Téléphone  : " . ($tel !== '' ? $tel : '—') . "\n"
      . "Demande    : $sujetLisible\n\n"
      . "Message :\n$message\n\n"
      . str_repeat('-', 52) . "\n"
      . "Consentement RGPD : accordé\n"
      . "Date : " . date('d/m/Y H:i') . "\n";

$headers  = "From: Site Bergerie de la Sille <no-reply@labergeriedelasille.be>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$subjectEnc = '=?UTF-8?B?' . base64_encode($subject) . '?=';

@mail($to, $subjectEnc, $body, $headers);

header('Location: ' . $pageOk);
exit;
